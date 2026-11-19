import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Event kinds. "reagendada" carries the new start so each reschedule notifies once.
// "reasignada" carries the new closer's id so each handover notifies that closer once.
export type Evento = "confirmacion" | "recordatorio_24h" | "recordatorio_1h" | "cancelada" | `reagendada:${string}` | `reasignada:${string}`;
type Canal = "whatsapp" | "email";
type Destinatario = "lead" | "closer";
type Resultado = { estado: "enviado" | "omitido" | "error"; detalle?: string };

// WhatsApp template names, as they must be registered in Meta (see docs/plantillas-whatsapp.md).
const PLANTILLAS = {
  confirmacion: "conexion_confirmacion_cita",
  recordatorio_24h: "conexion_recordatorio_24h",
  recordatorio_1h: "conexion_recordatorio_1h",
  closer_nueva: "conexion_nueva_cita_closer",
} as const;

const cuando = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });

type CitaCompleta = {
  id: string;
  start_at: string;
  end_at: string;
  estado: string;
  leads: { nombre: string; email: string; telefono: string | null } | null;
  sellers: { nombre: string; email: string; whatsapp: string | null; link_reunion: string | null } | null;
};

const unaRel = <T,>(r: T | T[] | null): T | null => (Array.isArray(r) ? r[0] ?? null : r);

async function cargarCita(citaId: string): Promise<CitaCompleta | null> {
  const { data } = await createAdminClient()
    .from("citas")
    .select("id, start_at, end_at, estado, leads(nombre, email, telefono), sellers(nombre, email, whatsapp, link_reunion)")
    .eq("id", citaId)
    .maybeSingle();
  if (!data) return null;
  return { ...data, leads: unaRel(data.leads), sellers: unaRel(data.sellers) } as CitaCompleta;
}

function soloDigitos(tel: string | null) {
  const d = (tel ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d : null;
}

// ───────────── WhatsApp (Meta Cloud API) ─────────────
async function enviarWhatsApp(telefono: string | null, plantilla: string, parametros: string[]): Promise<Resultado> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { estado: "omitido", detalle: "WhatsApp todavía no está configurado" };
  const to = soloDigitos(telefono);
  if (!to) return { estado: "omitido", detalle: "Sin número de WhatsApp válido" };

  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: plantilla,
        language: { code: "es" },
        components: [{ type: "body", parameters: parametros.map((text) => ({ type: "text", text })) }],
      },
    }),
  });
  if (res.ok) return { estado: "enviado" };
  return { estado: "error", detalle: `Meta ${res.status}: ${(await res.text()).slice(0, 300)}` };
}

// ───────────── Email (Resend) con invitación de calendario ─────────────
function icsFecha(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function icsTexto(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// Same UID for every message about one appointment, so calendars update or remove the same event.
function generarIcs(cita: CitaCompleta, cancelar: boolean, secuencia: number) {
  const lead = cita.leads!, closer = cita.sellers!;
  const descripcion = [`Llamada de Conexión con ${lead.nombre}.`, closer.link_reunion ? `Enlace: ${closer.link_reunion}` : ""].filter(Boolean).join("\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Conexion Agency//Panel//ES",
    "CALSCALE:GREGORIAN",
    `METHOD:${cancelar ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:cita-${cita.id}@conexion.agency`,
    `SEQUENCE:${secuencia}`,
    `DTSTAMP:${icsFecha(new Date().toISOString())}`,
    `DTSTART:${icsFecha(cita.start_at)}`,
    `DTEND:${icsFecha(cita.end_at)}`,
    `SUMMARY:${icsTexto(`Conexión · Llamada con ${lead.nombre}`)}`,
    `DESCRIPTION:${icsTexto(descripcion)}`,
    closer.link_reunion ? `LOCATION:${icsTexto(closer.link_reunion)}` : "",
    `ORGANIZER;CN=${icsTexto(closer.nombre)}:mailto:${closer.email}`,
    `ATTENDEE;CN=${icsTexto(lead.nombre)};RSVP=TRUE:mailto:${lead.email}`,
    `STATUS:${cancelar ? "CANCELLED" : "CONFIRMED"}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

async function enviarEmail(para: string, asunto: string, html: string, ics?: string): Promise<Resultado> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_REMITENTE;
  if (!key || !from) return { estado: "omitido", detalle: "Correo todavía no está configurado" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: [para], subject: asunto, html,
      attachments: ics ? [{ filename: "llamada-conexion.ics", content: Buffer.from(ics).toString("base64"), content_type: "text/calendar; method=REQUEST" }] : undefined,
    }),
  });
  if (res.ok) return { estado: "enviado" };
  return { estado: "error", detalle: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
}

// ───────────── Registro idempotente ─────────────
// Claims the (cita, evento, canal, destinatario) slot first; if it already exists, someone already sent it.
async function unaVez(citaId: string, evento: Evento, canal: Canal, destinatario: Destinatario, enviar: () => Promise<Resultado>) {
  const admin = createAdminClient();
  const { data: reclamado, error } = await admin
    .from("notificaciones")
    .insert({ cita_id: citaId, evento, canal, destinatario, estado: "enviando" })
    .select("id")
    .maybeSingle();
  if (error || !reclamado) return; // already sent (unique violation) — never send twice
  let r: Resultado;
  try {
    r = await enviar();
  } catch (e) {
    r = { estado: "error", detalle: e instanceof Error ? e.message : String(e) };
  }
  await admin.from("notificaciones").update({ estado: r.estado, detalle: r.detalle ?? null }).eq("id", reclamado.id);
}

// ───────────── Punto de entrada ─────────────
export async function notificarCita(citaId: string, evento: Evento) {
  const cita = await cargarCita(citaId);
  if (!cita?.leads || !cita.sellers) return;
  const lead = cita.leads, closer = cita.sellers;
  const fecha = cuando.format(new Date(cita.start_at));
  const primerNombre = lead.nombre.split(" ")[0];
  const enlace = closer.link_reunion ? `<p>Enlace de la videollamada: <a href="${closer.link_reunion}">${closer.link_reunion}</a></p>` : "";
  const reagendada = evento.startsWith("reagendada:");
  const secuencia = Math.floor(Date.now() / 1000); // later messages always win in the calendar

  const tareas: Promise<void>[] = [];

  if (evento === "confirmacion" || reagendada) {
    const titulo = reagendada ? "Tu llamada con Conexión cambió de horario" : "Tu llamada con Conexión quedó agendada";
    tareas.push(unaVez(citaId, evento, "email", "lead", () => enviarEmail(lead.email, titulo,
      `<p>Hola ${primerNombre},</p><p>${reagendada ? "Tu llamada ahora es el" : "Tu llamada quedó agendada para el"} <strong>${fecha}</strong> (hora de Colombia) con ${closer.nombre}.</p>${enlace}<p>Te dejamos la invitación adjunta para que quede en tu calendario.</p><p>— Equipo Conexión</p>`,
      generarIcs(cita, false, secuencia))));
    tareas.push(unaVez(citaId, evento, "email", "closer", () => enviarEmail(closer.email, `${reagendada ? "Cita reagendada" : "Nueva cita"}: ${lead.nombre} · ${fecha}`,
      `<p>${reagendada ? "Se reagendó" : "Tienes una nueva"} llamada con <strong>${lead.nombre}</strong> el <strong>${fecha}</strong> (hora de Colombia).</p><p>Correo: ${lead.email}${lead.telefono ? ` · WhatsApp: ${lead.telefono}` : ""}</p>`,
      generarIcs(cita, false, secuencia))));
    tareas.push(unaVez(citaId, evento, "whatsapp", "lead", () => enviarWhatsApp(lead.telefono, PLANTILLAS.confirmacion, [primerNombre, fecha, closer.nombre])));
    tareas.push(unaVez(citaId, evento, "whatsapp", "closer", () => enviarWhatsApp(closer.whatsapp, PLANTILLAS.closer_nueva, [lead.nombre, fecha])));
  }

  if (evento.startsWith("reasignada:")) {
    // The appointment moved to a new closer: they get the invite; the lead keeps the same time.
    tareas.push(unaVez(citaId, evento, "email", "closer", () => enviarEmail(closer.email, `Te pasaron una cita: ${lead.nombre} · ${fecha}`,
      `<p>Ahora tienes a tu cargo la llamada con <strong>${lead.nombre}</strong> el <strong>${fecha}</strong> (hora de Colombia).</p><p>Correo: ${lead.email}${lead.telefono ? ` · WhatsApp: ${lead.telefono}` : ""}</p>`,
      generarIcs(cita, false, secuencia))));
    tareas.push(unaVez(citaId, evento, "whatsapp", "closer", () => enviarWhatsApp(closer.whatsapp, PLANTILLAS.closer_nueva, [lead.nombre, fecha])));
  }

  if (evento === "recordatorio_24h") {
    tareas.push(unaVez(citaId, evento, "whatsapp", "lead", () => enviarWhatsApp(lead.telefono, PLANTILLAS.recordatorio_24h, [primerNombre, fecha, closer.nombre])));
    tareas.push(unaVez(citaId, evento, "email", "lead", () => enviarEmail(lead.email, "Mañana es tu llamada con Conexión",
      `<p>Hola ${primerNombre},</p><p>Te recordamos tu llamada el <strong>${fecha}</strong> (hora de Colombia) con ${closer.nombre}.</p>${enlace}<p>— Equipo Conexión</p>`)));
  }

  if (evento === "recordatorio_1h") {
    tareas.push(unaVez(citaId, evento, "whatsapp", "lead", () => enviarWhatsApp(lead.telefono, PLANTILLAS.recordatorio_1h, [primerNombre, fecha, closer.nombre])));
  }

  if (evento === "cancelada") {
    // Removes the event from both calendars.
    tareas.push(unaVez(citaId, evento, "email", "lead", () => enviarEmail(lead.email, "Tu llamada con Conexión fue cancelada",
      `<p>Hola ${primerNombre},</p><p>Tu llamada del ${fecha} fue cancelada. Si quieres agendar otra, responde este correo.</p><p>— Equipo Conexión</p>`,
      generarIcs(cita, true, secuencia))));
    tareas.push(unaVez(citaId, evento, "email", "closer", () => enviarEmail(closer.email, `Cita cancelada: ${lead.nombre} · ${fecha}`,
      `<p>Se canceló la llamada con ${lead.nombre} del ${fecha}.</p>`, generarIcs(cita, true, secuencia))));
  }

  await Promise.all(tareas);
}

// A failed email or WhatsApp must never undo or block the booking itself; failures stay in the log.
export async function notificarSinBloquear(citaId: string, evento: Evento) {
  try {
    await notificarCita(citaId, evento);
  } catch (e) {
    console.error("notificarCita", citaId, evento, e);
  }
}

// Called by the scheduler every few minutes. Windows overlap the run interval, and the unique log
// guarantees each reminder goes out once.
export async function procesarRecordatorios() {
  const admin = createAdminClient();
  const ahora = Date.now();
  const { data: citas } = await admin
    .from("citas")
    .select("id, start_at")
    .in("estado", ["agendada", "reagendada"])
    .gt("start_at", new Date(ahora).toISOString())
    .lte("start_at", new Date(ahora + 24 * 3600_000).toISOString());

  let enviadas = 0;
  for (const c of citas ?? []) {
    const falta = new Date(c.start_at).getTime() - ahora;
    if (falta <= 75 * 60_000) await notificarCita(c.id, "recordatorio_1h");
    // Skip the 24h reminder when the call was booked for the next few hours: the 1h one covers it.
    else if (falta > 3 * 3600_000) await notificarCita(c.id, "recordatorio_24h");
    enviadas++;
  }
  return { revisadas: enviadas };
}
