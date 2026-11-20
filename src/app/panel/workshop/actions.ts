"use server";

import { revalidatePath } from "next/cache";
import { requireGestor } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { activarInscripcion, darAccesoManual, reenviarAcceso, venceAt, type Credenciales } from "@/lib/workshop-acceso";
import { recursosDesdeTexto } from "@/lib/video";
import { mensajeError } from "@/lib/format";

export type EstadoCred = { error?: string; ok?: string; credenciales?: Credenciales; whatsapp?: string | null } | null;
type Estado = { error?: string; ok?: string } | null;

const txt = (f: FormData, k: string, n = 500) => String(f.get(k) ?? "").trim().slice(0, n);
const refrescar = () => { revalidatePath("/panel/workshop", "layout"); revalidatePath("/workshop"); revalidatePath("/curso", "layout"); };

// ───────────── Alumnos y accesos ─────────────

// Acceso manual con correo y contraseña: crea el alumno, su usuario de Auth y la inscripción activa.
export async function darAcceso(_prev: EstadoCred, f: FormData): Promise<EstadoCred> {
  const { seller } = await requireGestor();
  const nombre = txt(f, "nombre", 120);
  const email = txt(f, "email", 160).toLowerCase();
  const whatsapp = txt(f, "whatsapp", 40) || null;
  const clave = txt(f, "clave", 72) || null;
  const cursoId = txt(f, "curso_id", 40);
  if (!nombre || !email || !cursoId) return { error: "Escribe nombre, correo y elige el curso." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Ese correo no parece válido." };
  if (clave && clave.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres (o déjala vacía para generar una)." };
  const r = await darAccesoManual({ nombre, email, whatsapp, clave, cursoId, sellerId: seller.id });
  refrescar();
  if (!r.ok) return { error: r.error };
  return { ok: "Acceso creado.", credenciales: r.credenciales, whatsapp };
}

// Nueva contraseña temporal + correo de acceso (reemplaza la contraseña actual del alumno).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function reenviar(inscripcionId: string, _prev: EstadoCred): Promise<EstadoCred> {
  await requireGestor();
  const admin = createAdminClient();
  const { data } = await admin.from("inscripciones").select("alumnos(whatsapp)").eq("id", inscripcionId).maybeSingle();
  const a = Array.isArray(data?.alumnos) ? data?.alumnos[0] : data?.alumnos;
  const r = await reenviarAcceso(inscripcionId);
  refrescar();
  if (!r.ok) return { error: r.error };
  return { ok: "Acceso reenviado con una contraseña nueva.", credenciales: r.credenciales, whatsapp: (a as { whatsapp?: string } | null)?.whatsapp ?? null };
}

// Activa a mano una inscripción pendiente (por ejemplo, pago por transferencia): crea el usuario y envía el acceso.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function activarManual(inscripcionId: string, _prev: EstadoCred): Promise<EstadoCred> {
  await requireGestor();
  const r = await activarInscripcion(inscripcionId);
  refrescar();
  if ("yaActiva" in r) return { ok: "La inscripción ya estaba activa. Usa «Reenviar acceso» si el alumno no tiene sus datos." };
  if (!r.ok) return { error: r.error };
  return { ok: "Inscripción activada.", credenciales: r.credenciales };
}

export async function revocar(inscripcionId: string) {
  await requireGestor();
  await createAdminClient().from("inscripciones").update({ estado: "revocada" }).eq("id", inscripcionId).eq("estado", "activa");
  refrescar();
}

// Garantía de 7 días: la devolución se procesa a mano en Bold; aquí se registra y se quita el acceso.
export async function reembolsar(inscripcionId: string) {
  await requireGestor();
  await createAdminClient().from("inscripciones").update({ estado: "reembolsada", reembolsada_at: new Date().toISOString() }).eq("id", inscripcionId).in("estado", ["activa", "revocada"]);
  refrescar();
}

// Devuelve el acceso a una inscripción revocada o reembolsada. Si el periodo ya venció, lo renueva.
export async function reactivar(inscripcionId: string) {
  await requireGestor();
  const admin = createAdminClient();
  const { data: i } = await admin.from("inscripciones").select("curso_id, vence_at").eq("id", inscripcionId).maybeSingle();
  if (!i) return;
  const vencida = i.vence_at && new Date(i.vence_at).getTime() <= Date.now();
  await admin.from("inscripciones")
    .update({ estado: "activa", reembolsada_at: null, ...(vencida || !i.vence_at ? { vence_at: await venceAt(admin, i.curso_id) } : {}) })
    .eq("id", inscripcionId).in("estado", ["revocada", "reembolsada", "activa"]);
  refrescar();
}

// ───────────── Contenido (RLS: solo gestores escriben) ─────────────

const num = (f: FormData, k: string) => { const n = Number(txt(f, k, 12)); return Number.isFinite(n) && txt(f, k) !== "" ? n : null; };

export async function guardarCurso(id: string, _prev: Estado, f: FormData): Promise<Estado> {
  const { supabase } = await requireGestor();
  const titulo = txt(f, "titulo", 120);
  if (!titulo) return { error: "El curso necesita un título." };
  const { error } = await supabase.from("cursos").update({
    titulo, descripcion: txt(f, "descripcion", 600) || null,
    precio_usd: num(f, "precio_usd"), precio_cop: num(f, "precio_cop"), meses_acceso: num(f, "meses_acceso"),
    activo: f.get("activo") === "on",
  }).eq("id", id);
  if (error) return { error: mensajeError(error) ?? "No se pudo guardar." };
  refrescar();
  return { ok: "Curso guardado." };
}

export async function crearCurso(_prev: Estado, f: FormData): Promise<Estado> {
  const { supabase } = await requireGestor();
  const titulo = txt(f, "titulo", 120);
  const slug = txt(f, "slug", 60).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!titulo || !slug) return { error: "Escribe el título y el slug (la parte de la URL)." };
  const { error } = await supabase.from("cursos").insert({ titulo, slug, activo: false });
  if (error) return { error: error.code === "23505" ? "Ya existe un curso con ese slug." : mensajeError(error) ?? "No se pudo crear." };
  refrescar();
  return { ok: "Curso creado (inactivo). Complétalo y actívalo." };
}

function datosModulo(f: FormData) {
  return {
    titulo: txt(f, "titulo", 160), descripcion: txt(f, "descripcion", 600) || null,
    letra: txt(f, "letra", 2).toUpperCase() || null, entregable: txt(f, "entregable", 300) || null,
    orden: num(f, "orden") ?? 1, numerado: f.get("numerado") === "on",
  };
}

export async function crearModulo(cursoId: string, _prev: Estado, f: FormData): Promise<Estado> {
  const { supabase } = await requireGestor();
  const d = datosModulo(f);
  if (!d.titulo) return { error: "El módulo necesita un título." };
  const { error } = await supabase.from("modulos").insert({ curso_id: cursoId, ...d });
  if (error) return { error: mensajeError(error) ?? "No se pudo crear." };
  refrescar();
  return { ok: "Módulo creado." };
}

export async function guardarModulo(id: string, _prev: Estado, f: FormData): Promise<Estado> {
  const { supabase } = await requireGestor();
  const d = datosModulo(f);
  if (!d.titulo) return { error: "El módulo necesita un título." };
  const { error } = await supabase.from("modulos").update(d).eq("id", id);
  if (error) return { error: mensajeError(error) ?? "No se pudo guardar." };
  refrescar();
  return { ok: "Módulo guardado." };
}

export async function borrarModulo(id: string) {
  const { supabase } = await requireGestor();
  await supabase.from("modulos").delete().eq("id", id);
  refrescar();
}

function datosLeccion(f: FormData) {
  const dur = num(f, "duracion_min");
  return {
    titulo: txt(f, "titulo", 160), descripcion: txt(f, "descripcion", 2000) || null,
    video_url: txt(f, "video_url", 500) || null, prompt: txt(f, "prompt", 8000) || null,
    duracion_min: dur !== null && dur >= 0 ? Math.round(dur) : null,
    orden: num(f, "orden") ?? 1, vista_previa: f.get("vista_previa") === "on",
    recursos: recursosDesdeTexto(txt(f, "recursos", 4000)),
  };
}

export async function crearLeccion(moduloId: string, _prev: Estado, f: FormData): Promise<Estado> {
  const { supabase } = await requireGestor();
  const d = datosLeccion(f);
  if (!d.titulo) return { error: "La lección necesita un título." };
  const { error } = await supabase.from("lecciones").insert({ modulo_id: moduloId, ...d });
  if (error) return { error: mensajeError(error) ?? "No se pudo crear." };
  refrescar();
  return { ok: "Lección creada." };
}

export async function guardarLeccion(id: string, _prev: Estado, f: FormData): Promise<Estado> {
  const { supabase } = await requireGestor();
  const d = datosLeccion(f);
  if (!d.titulo) return { error: "La lección necesita un título." };
  const { error } = await supabase.from("lecciones").update(d).eq("id", id);
  if (error) return { error: mensajeError(error) ?? "No se pudo guardar." };
  refrescar();
  return { ok: "Lección guardada." };
}

export async function borrarLeccion(id: string) {
  const { supabase } = await requireGestor();
  await supabase.from("lecciones").delete().eq("id", id);
  refrescar();
}
