"use server";

import { revalidatePath } from "next/cache";
import { requireSeller, esGestor } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mensajeError } from "@/lib/format";
import type { Estado } from "../leads/actions";

const MONEDAS = ["USD", "COP", "MXN"];

export async function registrarVenta(leadId: string, _prev: Estado, formData: FormData): Promise<Estado> {
  const { seller, supabase } = await requireSeller();
  const producto = String(formData.get("producto") ?? "").trim();
  const moneda = String(formData.get("moneda") ?? "USD");
  const total = Number(formData.get("monto_total"));
  const abonado = Number(formData.get("monto_abonado") ?? 0);
  if (!producto) return { error: "Escribe qué producto o servicio se vendió." };
  if (!MONEDAS.includes(moneda)) return { error: "Moneda no válida." };
  if (!(total > 0)) return { error: "El monto total tiene que ser mayor a 0." };
  if (!(abonado >= 0) || abonado > total) return { error: "Lo abonado no puede ser negativo ni mayor al total." };

  // The sale is credited to the lead's current owner (a manager may register it on their behalf).
  const admin = createAdminClient();
  const { data: asignacion } = await admin.from("lead_assignments").select("seller_id").eq("lead_id", leadId).eq("activo", true).maybeSingle();
  const sellerId = asignacion?.seller_id ?? seller.id;
  if (sellerId !== seller.id && !esGestor(seller)) return { error: "Este lead es de otro vendedor; la venta se registra a su nombre." };

  const { error } = await supabase.from("ventas").insert({ lead_id: leadId, seller_id: sellerId, producto, moneda, monto_total: total, monto_abonado: abonado });
  if (error) return { error: mensajeError(error)! };
  revalidatePath(`/panel/leads/${leadId}`);
  revalidatePath("/panel/ventas");
  return { ok: "Venta registrada y enviada a entrega." };
}

export async function registrarAbono(ventaId: string, formData: FormData) {
  const { seller, supabase } = await requireSeller();
  if (!esGestor(seller)) return;
  const abono = Number(formData.get("abono"));
  if (!(abono > 0)) return;
  const { data: venta } = await supabase.from("ventas").select("monto_abonado, monto_total").eq("id", ventaId).maybeSingle();
  if (!venta) return;
  const nuevo = Math.min(Number(venta.monto_total), Number(venta.monto_abonado) + abono);
  await supabase.from("ventas").update({ monto_abonado: nuevo }).eq("id", ventaId);
  revalidatePath("/panel/ventas");
}

export async function procesarHandoff(handoffId: string) {
  const { seller, supabase } = await requireSeller();
  if (!esGestor(seller)) return;
  await supabase.from("sale_handoffs").update({ estado: "procesado", procesado_at: new Date().toISOString() }).eq("id", handoffId);
  revalidatePath("/panel/ventas");
  revalidatePath("/panel");
}
