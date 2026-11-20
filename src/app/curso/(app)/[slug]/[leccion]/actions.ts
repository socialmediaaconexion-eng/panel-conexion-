"use server";

import { revalidatePath } from "next/cache";
import { requireAlumno } from "@/lib/alumno";

// Marca o desmarca una lección como vista. RLS solo deja marcar lecciones de cursos activos (o vista previa).
export async function marcarLeccion(slug: string, leccionId: string, vista: boolean) {
  const { alumno, supabase } = await requireAlumno();
  if (vista) {
    await supabase.from("progreso_lecciones").upsert({ alumno_id: alumno.id, leccion_id: leccionId }, { onConflict: "alumno_id,leccion_id", ignoreDuplicates: true });
  } else {
    await supabase.from("progreso_lecciones").delete().eq("alumno_id", alumno.id).eq("leccion_id", leccionId);
  }
  revalidatePath(`/curso/${slug}`, "layout");
  revalidatePath("/curso");
}
