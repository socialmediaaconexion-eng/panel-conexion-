"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { firmarLead, verificarLead, slotsDisponibles, DURACION_LLAMADA_MIN } from "@/lib/agenda";

const EMBUDO = "vsl-conexion";

export async function aplicar(_prev: string | null, formData: FormData): Promise<string | null> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nombre || !email || !telefono) return "Completa nombre, correo y WhatsApp.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Ese correo no parece válido.";

  const respuestas = {
    negocio: String(formData.get("negocio") ?? ""),
    necesidad: String(formData.get("necesidad") ?? ""),
    inversion: String(formData.get("inversion") ?? ""),
    cuando: String(formData.get("cuando") ?? ""),
  };

  const admin = createAdminClient();
  // Re-applying with the same email updates the answers instead of duplicating the lead.
  const { data: lead, error } = await admin
    .from("leads")
    .upsert(
      {
        nombre, email, telefono, embudo: EMBUDO, respuestas,
        utm_source: String(formData.get("utm_source") ?? "") || null,
        utm_campaign: String(formData.get("utm_campaign") ?? "") || null,
      },
      { onConflict: "email,embudo" },
    )
    .select("id")
    .single();
  if (error) return "No pudimos guardar tu aplicación. Intenta de nuevo en un momento.";

  // Only assigns when the lead has no owner yet (enforced inside the function, with a lock).
  await admin.rpc("fn_asignar_round_robin", { p_lead: lead.id });
  redirect(`/agenda?lead=${lead.id}&t=${firmarLead(lead.id)}`);
}

export async function agendarLlamada(leadId: string, token: string, _prev: string | null, formData: FormData): Promise<string | null> {
  if (!verificarLead(leadId, token)) return "Este enlace no es válido. Vuelve a aplicar desde el inicio.";
  const slot = String(formData.get("slot") ?? "");
  const disponibles = await slotsDisponibles();
  const libres = disponibles.get(slot);
  if (!libres || libres.length === 0) return "Ese horario se acaba de ocupar. Elige otro, por favor.";

  const admin = createAdminClient();
  const { data: asignacion } = await admin.from("lead_assignments").select("seller_id").eq("lead_id", leadId).eq("activo", true).maybeSingle();
  // Keep the current owner when they're free at that time; otherwise the first free closer takes it.
  const closerId = asignacion && libres.includes(asignacion.seller_id) ? asignacion.seller_id : libres[0];

  const start = new Date(slot);
  const end = new Date(start.getTime() + DURACION_LLAMADA_MIN * 60_000);
  const { data: existente } = await admin.from("citas").select("id").eq("lead_id", leadId).in("estado", ["agendada", "reagendada"]).gt("start_at", new Date().toISOString()).maybeSingle();
  if (existente) redirect(`/gracias?lead=${leadId}&t=${token}`);

  const { error } = await admin.from("citas").insert({ lead_id: leadId, seller_id: closerId, start_at: start.toISOString(), end_at: end.toISOString(), notas: "Agendada desde el embudo VSL" });
  if (error) return "Ese horario se acaba de ocupar. Elige otro, por favor."; // exclusion constraint caught a race

  if (asignacion?.seller_id !== closerId) {
    await admin.from("lead_assignments").update({ activo: false }).eq("lead_id", leadId).eq("activo", true);
    await admin.from("lead_assignments").insert({ lead_id: leadId, seller_id: closerId, motivo: asignacion ? "handoff_setter_closer" : "auto:round_robin" });
  }
  await admin.from("leads").update({ etapa: "agendado" }).eq("id", leadId).in("etapa", ["nuevo", "contactado"]);
  redirect(`/gracias?lead=${leadId}&t=${token}`);
}
