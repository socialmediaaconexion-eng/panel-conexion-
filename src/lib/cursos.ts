import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Curso = { id: string; slug: string; titulo: string; descripcion: string | null; precio_usd: number | null; precio_cop: number | null; meses_acceso: number | null; activo: boolean };
export type LeccionResumen = { id: string; orden: number; titulo: string; duracion_min: number | null; vista_previa: boolean };
export type ModuloResumen = { id: string; orden: number; titulo: string; descripcion: string | null; letra: string | null; entregable: string | null; numerado: boolean; lecciones: LeccionResumen[] };

const porOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden;

// Temario público de un curso (sin video_url): para la landing y para alumnos sin el curso activo.
// Usa la clave de servicio y elige columnas a mano: nunca expone los videos de lecciones bloqueadas.
export async function temarioPublico(slug: string): Promise<{ curso: Curso; modulos: ModuloResumen[] } | null> {
  const admin = createAdminClient();
  const { data: curso } = await admin.from("cursos").select("id, slug, titulo, descripcion, precio_usd, precio_cop, meses_acceso, activo").eq("slug", slug).eq("activo", true).maybeSingle<Curso>();
  if (!curso) return null;
  const { data: mods } = await admin.from("modulos")
    .select("id, orden, titulo, descripcion, letra, entregable, numerado, lecciones(id, orden, titulo, duracion_min, vista_previa)")
    .eq("curso_id", curso.id);
  const modulos = ((mods ?? []) as ModuloResumen[])
    .map((m) => ({ ...m, lecciones: [...(m.lecciones ?? [])].sort(porOrden) }))
    .sort(porOrden);
  return { curso: { ...curso, precio_usd: curso.precio_usd ? Number(curso.precio_usd) : null, precio_cop: curso.precio_cop ? Number(curso.precio_cop) : null }, modulos };
}

export const minutosTotales = (m: ModuloResumen[]) => m.reduce((t, x) => t + x.lecciones.reduce((s, l) => s + (l.duracion_min ?? 0), 0), 0);
export const leccionesTotales = (m: ModuloResumen[]) => m.reduce((t, x) => t + x.lecciones.length, 0);
