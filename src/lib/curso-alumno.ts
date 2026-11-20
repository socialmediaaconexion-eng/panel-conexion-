import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { temarioPublico, type LeccionResumen, type ModuloResumen } from "@/lib/cursos";

type Cliente = Awaited<ReturnType<typeof createClient>>;
export type LeccionPlano = LeccionResumen & { modulo: string; bloqueada: boolean; vista: boolean };

// Curso visto por un alumno: el temario sale sin videos (clave de servicio, columnas elegidas) y el acceso a cada
// lección lo decide RLS con la sesión del alumno (curso activo o vista previa).
export async function cursoDelAlumno(supabase: Cliente, alumnoId: string, slug: string) {
  const t = await temarioPublico(slug);
  if (!t) return null;
  const [{ data: insc }, { data: progreso }] = await Promise.all([
    supabase.from("inscripciones").select("id, vence_at").eq("curso_id", t.curso.id).eq("alumno_id", alumnoId).eq("estado", "activa").maybeSingle(),
    supabase.from("progreso_lecciones").select("leccion_id").eq("alumno_id", alumnoId),
  ]);
  // Acceso por tiempo limitado (ALMA: 12 meses). La misma regla la aplica RLS en fn_tiene_curso.
  const venceAt = (insc?.vence_at as string | null) ?? null;
  const vencida = Boolean(insc && venceAt && new Date(venceAt).getTime() <= Date.now());
  const activa = Boolean(insc) && !vencida;
  const vistas = new Set((progreso ?? []).map((p) => p.leccion_id as string));
  const modulos: (Omit<ModuloResumen, "lecciones"> & { lecciones: LeccionPlano[] })[] =t.modulos.map((m) => ({
    ...m,
    lecciones: m.lecciones.map((l) => ({ ...l, modulo: m.titulo, bloqueada: !activa && !l.vista_previa, vista: vistas.has(l.id) })),
  }));
  const plano = modulos.flatMap((m) => m.lecciones);
  const total = plano.length;
  const hechas = plano.filter((l) => l.vista).length;
  const siguiente = plano.find((l) => !l.bloqueada && !l.vista) ?? plano.find((l) => !l.bloqueada) ?? null;
  return { curso: t.curso, activa, vencida, venceAt, modulos, plano, total, hechas, siguiente };
}
