"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSeller, esGestor } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mensajeError, ETAPAS } from "@/lib/format";

export type Estado = { error?: string; ok?: string } | null;

export async function crearLead(_prev: Estado, formData: FormData): Promise<Estado> {
  const { seller } = await requireSeller();
  const admin = createAdminClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!nombre || !email) return { error: "Nombre y correo son obligatorios." };

  const { data: lead, error } = await admin
    .from("leads")
    .insert({
      nombre,
      email,
      telefono: String(formData.get("telefono") ?? "").trim() || null,
      embudo: String(formData.get("embudo") ?? "").trim() || "manual",
      notas: String(formData.get("notas") ?? "").trim() || null,
    })
    .select("id")
    .single();
  if (error) return { error: mensajeError(error)! };

  // A lead created by hand belongs to whoever created it.
  const { error: e2 } = await admin.from("lead_assignments").insert({ lead_id: lead.id, seller_id: seller.id, assigned_by: seller.id, motivo: "manual" });
  if (e2) return { error: mensajeError(e2)! };
  revalidatePath("/panel/leads");
  redirect(`/panel/leads/${lead.id}`);
}

export async function cambiarEtapa(leadId: string, formData: FormData) {
  const { supabase } = await requireSeller();
  const etapa = String(formData.get("etapa"));
  if (!ETAPAS.includes(etapa as (typeof ETAPAS)[number])) return;
  await supabase.from("leads").update({ etapa }).eq("id", leadId);
  revalidatePath(`/panel/leads/${leadId}`);
  revalidatePath("/panel/leads");
}

export async function guardarNotas(leadId: string, formData: FormData) {
  const { supabase } = await requireSeller();
  await supabase.from("leads").update({ notas: String(formData.get("notas") ?? "") }).eq("id", leadId);
  revalidatePath(`/panel/leads/${leadId}`);
}

export async function reasignar(leadId: string, _prev: Estado, formData: FormData): Promise<Estado> {
  const { seller, supabase } = await requireSeller();
  if (!esGestor(seller)) return { error: "No tienes permiso para reasignar leads. Pídeselo a un administrador." };
  const { error } = await supabase.rpc("fn_reasignar_lead", { p_lead: leadId, p_seller: String(formData.get("seller_id")) });
  if (error) return { error: mensajeError(error)! };
  revalidatePath(`/panel/leads/${leadId}`);
  revalidatePath("/panel/leads");
  return { ok: "Lead reasignado. Sus citas futuras también pasaron al nuevo dueño." };
}
