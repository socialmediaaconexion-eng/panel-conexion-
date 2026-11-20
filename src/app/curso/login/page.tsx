import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginCursoForm } from "./form";
import { salirCurso } from "./actions";
import { Instalar } from "@/components/workshop/instalar";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string }> };

const AVISOS: Record<string, string> = {
  "ya-activo": "Ya tienes acceso a este curso. Entra con tu correo y tu contraseña.",
  enlace: "El enlace para cambiar la contraseña venció o ya se usó. Pide uno nuevo.",
};

export default async function LoginCurso({ searchParams }: Props) {
  const { e } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: alumno } = await supabase.from("alumnos").select("id").eq("user_id", user.id).maybeSingle();
    if (alumno) redirect("/curso");
  }

  return (
    <main className="public alu-login">
      <div className="public-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" />
        <h1>Entra a tu curso</h1>
        <p className="muted">Usa el correo y la contraseña que te llegaron después de la compra.</p>
        {user && (
          // Sesión abierta que no es de alumno (por ejemplo, del panel del equipo): no se cuela al curso.
          <div className="alert error">
            Tienes abierta una sesión que no es de alumno{user.email ? ` (${user.email})` : ""}. Ciérrala para entrar con tu cuenta del curso.
            <form action={salirCurso} style={{ marginTop: 8 }}><button type="submit" className="ghost small">Cerrar esa sesión</button></form>
          </div>
        )}
        {e && AVISOS[e] && <div className="alert ok">{AVISOS[e]}</div>}
        <LoginCursoForm />
        <Instalar />
      </div>
      <p className="muted small" style={{ textAlign: "center", marginTop: 16 }}>¿Aún no tienes el curso? <Link href="/workshop">Conócelo aquí</Link></p>
    </main>
  );
}
