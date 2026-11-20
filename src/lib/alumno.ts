import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Alumno = {
  id: string;
  user_id: string | null;
  nombre: string;
  email: string;
  whatsapp: string | null;
  created_at: string;
};

// Guarda del área del alumno. Separada del equipo: exige una fila en `alumnos` (nunca mira `sellers`).
// Un miembro del equipo con sesión abierta no entra como alumno: va al login del curso con un aviso.
export async function requireAlumno(): Promise<{ alumno: Alumno; supabase: Awaited<ReturnType<typeof createClient>> }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/curso/login");
  const { data: alumno } = await supabase.from("alumnos").select("*").eq("user_id", user.id).maybeSingle<Alumno>();
  if (!alumno) redirect("/curso/login?e=sin-curso");
  return { alumno, supabase };
}
