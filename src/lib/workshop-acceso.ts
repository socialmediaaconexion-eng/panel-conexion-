import "server-only";
import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { estadoLinkBold } from "@/lib/bold";
import { enviarEmail } from "@/lib/notificaciones";
import { WORKSHOP, siteUrl } from "@/lib/workshop";

// Accesos del workshop: activar inscripciones pagadas, crear el usuario del alumno en Supabase Auth
// (separado del equipo) y enviar el correo de acceso. Todo con la clave de servicio: solo se llama desde
// el servidor después de validar quién lo pide (cron con secreto, gestor del panel o la página de gracias).

type Admin = ReturnType<typeof createAdminClient>;
type AlumnoFila = { id: string; user_id: string | null; nombre: string; email: string; whatsapp: string | null };
type Inscripcion = {
  id: string; alumno_id: string; curso_id: string; estado: string; origen: string; cobro_id: string | null;
  sesion: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null;
};
export type Credenciales = { correo: string; clave: string | null; url: string; envio: string };
export type ResultadoAcceso = { ok: true; credenciales: Credenciales } | { ok: false; error: string };

const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generarClave(largo = 10) {
  return Array.from({ length: largo }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const ahora = () => new Date().toISOString();

// ¿El correo pertenece al equipo? Un miembro del equipo nunca se convierte en alumno (ni al revés).
export async function esCorreoDelEquipo(email: string, admin: Admin = createAdminClient()) {
  const { data } = await admin.from("sellers").select("id").ilike("email", email.replace(/[%_\\]/g, "\\$&")).limit(1);
  return Boolean(data?.length);
}

// Garantiza que el alumno tenga usuario de Auth. Si no existe, lo crea con `clave` (o una temporal).
// Si ya existe y se pasa `clave`, la reemplaza. Devuelve la clave que el alumno debe usar (null = la que ya tenía).
async function asegurarUsuario(admin: Admin, alumno: AlumnoFila, clave?: string): Promise<{ ok: true; clave: string | null } | { ok: false; error: string }> {
  if (await esCorreoDelEquipo(alumno.email, admin)) return { ok: false, error: "Ese correo pertenece a una cuenta del equipo. Usa otro correo para el alumno." };

  let userId = alumno.user_id;
  if (!userId) {
    const { data } = await admin.rpc("fn_usuario_por_email", { p_email: alumno.email });
    userId = (data as string | null) ?? null;
  }
  if (userId) {
    const { data: s } = await admin.from("sellers").select("id").eq("user_id", userId).limit(1);
    if (s?.length) return { ok: false, error: "Ese usuario es del equipo. Usa otro correo para el alumno." };
    if (clave) {
      const { error } = await admin.auth.admin.updateUserById(userId, { password: clave });
      if (error) return { ok: false, error: `No se pudo cambiar la contraseña: ${error.message}` };
    }
  } else {
    clave = clave || generarClave();
    const { data, error } = await admin.auth.admin.createUser({
      email: alumno.email, password: clave, email_confirm: true,
      user_metadata: { nombre: alumno.nombre, tipo: "alumno" },
    });
    if (error || !data.user) return { ok: false, error: `No se pudo crear el usuario: ${error?.message ?? "sin respuesta"}` };
    userId = data.user.id;
  }
  if (alumno.user_id !== userId) {
    const { error } = await admin.from("alumnos").update({ user_id: userId }).eq("id", alumno.id);
    if (error) return { ok: false, error: "No se pudo enlazar el usuario con el alumno." };
  }
  return { ok: true, clave: clave ?? null };
}

// Correo de acceso. Usa Resend (RESEND_API_KEY + EMAIL_REMITENTE); si falta, devuelve el motivo para dejarlo registrado.
export async function enviarCorreoAcceso(p: { email: string; nombre: string; curso: string; clave: string | null }) {
  const url = `${siteUrl()}/curso/login`;
  const primer = esc(p.nombre.split(" ")[0] || p.nombre);
  // COPY PROVISIONAL
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0d0d0f">
<p>Hola ${primer},</p>
<p>Ya tienes acceso a <strong>${esc(p.curso)}</strong>.</p>
<p>Entra aquí: <a href="${url}" style="color:#b8924a">${url}</a></p>
<p>Usuario: <strong>${esc(p.email)}</strong><br>${p.clave ? `Contraseña temporal: <strong>${esc(p.clave)}</strong>` : "Contraseña: la que ya usas en Conexión (si no la recuerdas, toca «Olvidé mi contraseña»)."}</p>
${p.clave ? "<p>Te recomendamos cambiarla la primera vez que entres (menú → Cambiar contraseña).</p>" : ""}
<p>Desde el celular puedes instalar el curso como una app con el botón «Instalar en mi celular».</p>
<p>— Equipo Conexión</p></div>`;
  const r = await enviarEmail(p.email, `Tu acceso a ${p.curso}`, html);
  const detalle = r.estado === "enviado" ? "enviado"
    : r.estado === "omitido" ? "Falta configurar el correo (RESEND_API_KEY / EMAIL_REMITENTE): envía las credenciales a mano."
    : `Error al enviar: ${r.detalle ?? "desconocido"}`;
  return { enviado: r.estado === "enviado", detalle };
}

// Evento del embudo desde el servidor, con la sesión y los UTMs que trajo la compra.
export async function registrarEventoWorkshop(evento: "workshop_checkout" | "workshop_pago" | "workshop_acceso", insc: Pick<Inscripcion, "sesion" | "utm_source" | "utm_medium" | "utm_campaign" | "utm_content">, admin: Admin = createAdminClient()) {
  if (!insc.sesion) return; // accesos manuales: no son parte del embudo
  await admin.from("embudo_eventos").insert({
    evento, sesion: insc.sesion, embudo: WORKSHOP.embudo,
    utm_source: insc.utm_source, utm_medium: insc.utm_medium, utm_campaign: insc.utm_campaign, utm_content: insc.utm_content,
  });
}

async function cargar(admin: Admin, id: string) {
  const { data } = await admin.from("inscripciones").select("*, alumnos(*), cursos(titulo)").eq("id", id).maybeSingle();
  if (!data) return null;
  const uno = <T,>(r: T | T[] | null): T | null => (Array.isArray(r) ? r[0] ?? null : r);
  return { insc: data as Inscripcion, alumno: uno(data.alumnos) as AlumnoFila | null, curso: (uno(data.cursos) as { titulo: string } | null)?.titulo ?? WORKSHOP.nombre };
}

// Da (o vuelve a dar) las credenciales de una inscripción activa y envía el correo.
async function entregarAcceso(admin: Admin, id: string, clave?: string): Promise<ResultadoAcceso> {
  const c = await cargar(admin, id);
  if (!c?.alumno) return { ok: false, error: "No se encontró la inscripción." };
  const u = await asegurarUsuario(admin, c.alumno, clave);
  if (!u.ok) {
    await admin.from("inscripciones").update({ acceso_detalle: u.error }).eq("id", id);
    return u;
  }
  const envio = await enviarCorreoAcceso({ email: c.alumno.email, nombre: c.alumno.nombre, curso: c.curso, clave: u.clave });
  await admin.from("inscripciones").update({ acceso_detalle: envio.detalle, ...(envio.enviado ? { acceso_enviado_at: ahora() } : {}) }).eq("id", id);
  return { ok: true, credenciales: { correo: c.alumno.email, clave: u.clave, url: `${siteUrl()}/curso/login`, envio: envio.detalle } };
}

// Fin del acceso: hoy + cursos.meses_acceso (ALMA: 12 meses). null = sin vencimiento.
export async function venceAt(admin: Admin, cursoId: string): Promise<string | null> {
  const { data } = await admin.from("cursos").select("meses_acceso").eq("id", cursoId).maybeSingle();
  const meses = Number(data?.meses_acceso);
  if (!meses) return null;
  const d = new Date();
  d.setMonth(d.getMonth() + meses);
  return d.toISOString();
}

// Pasa una inscripción pendiente a activa una sola vez (aunque el cron y la página de gracias corran a la vez).
export async function activarInscripcion(id: string, admin: Admin = createAdminClient()): Promise<ResultadoAcceso | { ok: true; yaActiva: true }> {
  const { data: tomada } = await admin.from("inscripciones")
    .update({ estado: "activa", activada_at: ahora() })
    .eq("id", id).eq("estado", "pendiente_pago")
    .select("*").maybeSingle();
  if (!tomada) return { ok: true, yaActiva: true };
  await admin.from("inscripciones").update({ vence_at: await venceAt(admin, tomada.curso_id) }).eq("id", id);
  if (tomada.origen === "pago_bold") await registrarEventoWorkshop("workshop_pago", tomada as Inscripcion, admin);
  return entregarAcceso(admin, id);
}

// Consulta en Bold el link de una inscripción pendiente y la activa si ya está pagado.
export async function verificarInscripcion(id: string, admin: Admin = createAdminClient()) {
  const { data: i } = await admin.from("inscripciones").select("id, estado, cobro_id, cobros(id, bold_link, estado)").eq("id", id).maybeSingle();
  if (!i) return null;
  const cobro = (Array.isArray(i.cobros) ? i.cobros[0] : i.cobros) as { id: string; bold_link: string | null; estado: string } | null;
  if (i.estado !== "pendiente_pago" || !cobro) return { estado: i.estado as string, pago: cobro?.estado ?? null };

  let pago = cobro.estado;
  if (pago !== "pagado" && cobro.bold_link) {
    const st = await estadoLinkBold(cobro.bold_link);
    if (st && st !== pago) {
      pago = st;
      await admin.from("cobros").update({ estado: st, actualizado_at: ahora(), ...(st === "pagado" ? { pagado_at: ahora() } : {}) }).eq("id", cobro.id);
    }
  }
  if (pago === "pagado") {
    await activarInscripcion(id, admin);
    return { estado: "activa", pago };
  }
  return { estado: "pendiente_pago", pago };
}

// Cron / panel: revisa las inscripciones pendientes de los últimos 14 días.
export async function activarPendientes() {
  const admin = createAdminClient();
  const { data } = await admin.from("inscripciones").select("id")
    .eq("estado", "pendiente_pago").not("cobro_id", "is", null)
    .gte("created_at", new Date(Date.now() - 14 * 86400_000).toISOString())
    .order("created_at", { ascending: false }).limit(40);
  let activadas = 0;
  for (const i of data ?? []) {
    const r = await verificarInscripcion(i.id, admin);
    if (r?.estado === "activa") activadas++;
  }
  return { revisadas: data?.length ?? 0, activadas };
}

// Panel: acceso manual con correo y contraseña (crea alumno, usuario e inscripción activa).
export async function darAccesoManual(p: { nombre: string; email: string; whatsapp: string | null; clave: string | null; cursoId: string; sellerId: string }): Promise<ResultadoAcceso> {
  const admin = createAdminClient();
  if (await esCorreoDelEquipo(p.email, admin)) return { ok: false, error: "Ese correo pertenece a una cuenta del equipo. Usa otro correo para el alumno." };

  const { data: existente } = await admin.from("alumnos").select("id, whatsapp").eq("email", p.email).maybeSingle();
  let alumnoId = existente?.id as string | undefined;
  if (!alumnoId) {
    const { data, error } = await admin.from("alumnos").insert({ nombre: p.nombre, email: p.email, whatsapp: p.whatsapp }).select("id").single();
    if (error || !data) return { ok: false, error: "No se pudo crear el alumno." };
    alumnoId = data.id;
  } else if (p.whatsapp && !existente?.whatsapp) {
    await admin.from("alumnos").update({ whatsapp: p.whatsapp }).eq("id", alumnoId);
  }

  const { data: insc } = await admin.from("inscripciones").select("id, estado").eq("alumno_id", alumnoId).eq("curso_id", p.cursoId).maybeSingle();
  let id = insc?.id as string | undefined;
  const vence_at = await venceAt(admin, p.cursoId);
  if (id) {
    // Reactivar (revocada, reembolsada, pendiente o vencida) renueva el periodo de acceso.
    await admin.from("inscripciones").update({ estado: "activa", activada_at: ahora(), vence_at, reembolsada_at: null, creado_por: p.sellerId }).eq("id", id);
  } else {
    const { data, error } = await admin.from("inscripciones")
      .insert({ alumno_id: alumnoId, curso_id: p.cursoId, estado: "activa", origen: "manual", activada_at: ahora(), vence_at, creado_por: p.sellerId })
      .select("id").single();
    if (error || !data) return { ok: false, error: "No se pudo crear la inscripción." };
    id = data.id;
  }
  return entregarAcceso(admin, id!, p.clave ?? undefined);
}

// Primera vez que el alumno entra al área del curso: se marca una sola vez por inscripción (paso "acceso" del embudo).
export async function marcarPrimerAcceso(alumnoId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("inscripciones")
    .update({ primer_acceso_at: ahora() })
    .eq("alumno_id", alumnoId).eq("estado", "activa").is("primer_acceso_at", null)
    .select("sesion, utm_source, utm_medium, utm_campaign, utm_content");
  for (const i of data ?? []) await registrarEventoWorkshop("workshop_acceso", i as Inscripcion, admin);
}

// Panel: genera una contraseña temporal nueva y reenvía el correo (reemplaza la contraseña actual del alumno).
export async function reenviarAcceso(inscripcionId: string): Promise<ResultadoAcceso> {
  const admin = createAdminClient();
  const { data } = await admin.from("inscripciones").select("estado").eq("id", inscripcionId).maybeSingle();
  if (!data) return { ok: false, error: "No se encontró la inscripción." };
  if (data.estado !== "activa") return { ok: false, error: "La inscripción no está activa. Actívala antes de reenviar el acceso." };
  return entregarAcceso(admin, inscripcionId, generarClave());
}
