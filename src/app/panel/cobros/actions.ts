"use server";

import { revalidatePath } from "next/cache";
import { requireGestor } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearLinkBold, estadoLinkBold } from "@/lib/bold";

type Res = { error?: string; ok?: string } | null;

export async function crearCobro(_prev: Res, formData: FormData): Promise<Res> {
  const { seller } = await requireGestor();
  const t = (k: string, n = 200) => String(formData.get(k) ?? "").trim().slice(0, n);
  const cliente_nombre = t("cliente_nombre", 120);
  const concepto = t("concepto", 100);
  const moneda = t("moneda") === "COP" ? "COP" : "USD";
  const monto = Number(t("monto").replace(/[^\d.]/g, ""));
  if (!cliente_nombre || !concepto) return { error: "Escribe el nombre del cliente y el concepto." };
  if (!Number.isFinite(monto) || monto <= 0) return { error: "El monto debe ser mayor que cero." };
  const cliente_email = t("cliente_email", 160).toLowerCase() || null;

  const admin = createAdminClient();
  const { data: cobro, error } = await admin.from("cobros")
    .insert({ creado_por: seller.id, cliente_nombre, cliente_email, cliente_telefono: t("cliente_telefono", 40) || null, concepto, moneda, monto, estado: "borrador" })
    .select("id").single();
  if (error || !cobro) return { error: "No se pudo guardar el cobro." };

  const r = await crearLinkBold({ monto, moneda, descripcion: `${concepto} · ${cliente_nombre}`, referencia: `CX-${cobro.id.slice(0, 8)}`, email: cliente_email });
  if (!r.ok) {
    await admin.from("cobros").update({ error: r.error }).eq("id", cobro.id);
    revalidatePath("/panel/cobros");
    return { error: `Se guardó como borrador, pero Bold no creó el link: ${r.error}` };
  }
  await admin.from("cobros").update({ bold_link: r.link, url: r.url, estado: "pendiente", error: null }).eq("id", cobro.id);
  revalidatePath("/panel/cobros");
  return { ok: "Link de pago creado. Cópialo o envíalo por WhatsApp." };
}

export async function reintentarCobro(id: string) {
  await requireGestor();
  const admin = createAdminClient();
  const { data: c } = await admin.from("cobros").select("*").eq("id", id).maybeSingle();
  if (!c || c.bold_link) return;
  const r = await crearLinkBold({ monto: Number(c.monto), moneda: c.moneda, descripcion: `${c.concepto} · ${c.cliente_nombre}`, referencia: `CX-${c.id.slice(0, 8)}`, email: c.cliente_email });
  await admin.from("cobros").update(r.ok ? { bold_link: r.link, url: r.url, estado: "pendiente", error: null } : { error: r.error }).eq("id", id);
  revalidatePath("/panel/cobros");
}

// Consulta en Bold el estado de los cobros abiertos (se llama al abrir la página).
export async function sincronizarCobros() {
  await requireGestor();
  const admin = createAdminClient();
  const { data } = await admin.from("cobros").select("id, bold_link, estado").in("estado", ["pendiente", "procesando"]).not("bold_link", "is", null).limit(30);
  await Promise.all((data ?? []).map(async (c) => {
    const st = await estadoLinkBold(c.bold_link!);
    if (st && st !== c.estado) {
      await admin.from("cobros").update({ estado: st, actualizado_at: new Date().toISOString(), ...(st === "pagado" ? { pagado_at: new Date().toISOString() } : {}) }).eq("id", c.id);
    }
  }));
}
