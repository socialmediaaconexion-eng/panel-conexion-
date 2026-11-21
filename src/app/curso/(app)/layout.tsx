import Link from "next/link";
import { requireAlumno } from "@/lib/alumno";
import { marcarPrimerAcceso } from "@/lib/workshop-acceso";
import { salirCurso } from "../login/actions";
import { Instalar } from "@/components/workshop/instalar";

export const dynamic = "force-dynamic";

// App del alumno (celular primero): barra superior con marca y menú; el contenido va en una columna.
export default async function AlumnoLayout({ children }: { children: React.ReactNode }) {
  const { alumno } = await requireAlumno();
  await marcarPrimerAcceso(alumno.id);
  return (
    <div className="alu-shell">
      <header className="alu-top">
        <Link href="/curso" className="alu-marca" aria-label="Mis cursos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-alma.png" alt="" />
          <strong>Mis cursos</strong>
        </Link>
        <details className="alu-menu">
          <summary aria-label="Menú"><span className="m-avatar">{alumno.nombre.charAt(0).toUpperCase()}</span></summary>
          <div className="alu-menu-hoja">
            <span className="muted small">{alumno.email}</span>
            <Link href="/curso/nueva-clave">Cambiar contraseña</Link>
            <Instalar />
            <form action={salirCurso}><button type="submit" className="ghost small">Cerrar sesión</button></form>
          </div>
        </details>
      </header>
      <main className="alu-main">{children}</main>
    </div>
  );
}
