"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { firmarLead, verificarLead, slotsDisponibles, DURACION_LLAMADA_MIN } from "@/lib/agenda";
import { notificarSinBloquear } from "@/lib/notificaciones";
import { PREGUNTAS, calificar, DURACION_POR_CALIFICACION, type Calificacion } from "@/lib/preguntas";

const EMBUDO = "vsl-conexion";

export async function aplicar(_prev: string | null, formData: FormData): Promise<string | null> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefono = String(formData.get("telefono") ?? "").trim();
  if (!nombre || !email || !telefono) return "Completa nombre, correo y WhatsApp.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Ese correo no parece válido.";

  const respuestas = Object.fromEntries(PREGUNTAS.map((q) => [q.id, String(formData.get(q.id) ?? "").slice(0, 120)]));
  if (PREGUNTAS.some((q) => !respuestas[q.id])) return "Responde todas las preguntas antes de continuar.";

  const admin = createAdminClient();
  // Re-applying with the same email updates the answers instead of duplicating the lead.
  const { data: lead, error } = await admin
    .from("leads")
    .upsert(
      {
        nombre, email, telefono, embudo: EMBUDO, respuestas, calificacion: calificar(respuestas),
        utm_source: String(formData.get("utm_source") ?? "") || null,
        utm_campaign: String(formData.get("utm_campaign") ?? "") || null,
        utm_medium: String(formData.get("utm_medium") ?? "") || null,
        utm_content: String(formData.get("utm_content") ?? "") || null,
        sesion: String(formData.get("sesion") ?? "").slice(0, 64) || null,
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
  const { data: leadCal } = await admin.from("leads").select("calificacion").eq("id", leadId).maybeSingle();
  const cal = (leadCal?.calificacion ?? "viable") as Calificacion;
  const { data: asignacion } = await admin.from("lead_assignments").select("seller_id").eq("lead_id", leadId).eq("activo", true).maybeSingle();
  // Keep the current owner when they're free at that time; otherwise the first free closer takes it.
  const closerId = asignacion && libres.includes(asignacion.seller_id) ? asignacion.seller_id : libres[0];

  const start = new Date(slot);
  const end = new Date(start.getTime() + DURACION_POR_CALIFICACION[cal] * 60_000);
  const { data: existente } = await admin.from("citas").select("id").eq("lead_id", leadId).in("estado", ["agendada", "reagendada"]).gt("start_at", new Date().toISOString()).maybeSingle();
  if (existente) redirect(`/gracias?lead=${leadId}&t=${token}`);

  const { data: cita, error } = await admin.from("citas").insert({ lead_id: leadId, seller_id: closerId, start_at: start.toISOString(), end_at: end.toISOString(), notas: cal === "asesoria" ? "Asesoría de regalo de 20 min (no calificó todavía) · embudo VSL" : "Diagnóstico 30 min (calificó como viable) · embudo VSL" }).select("id").single();
  if (error) return "Ese horario se acaba de ocupar. Elige otro, por favor."; // exclusion constraint caught a race

  if (asignacion?.seller_id !== closerId) {
    await admin.from("lead_assignments").update({ activo: false }).eq("lead_id", leadId).eq("activo", true);
    await admin.from("lead_assignments").insert({ lead_id: leadId, seller_id: closerId, motivo: asignacion ? "handoff_setter_closer" : "auto:round_robin" });
  }
  await admin.from("leads").update({ etapa: "agendado" }).eq("id", leadId).in("etapa", ["nuevo", "contactado"]);
  await notificarSinBloquear(cita.id, "confirmacion");
  redirect(`/gracias?lead=${leadId}&t=${token}`);
}
