import { logout } from "../login/actions";

export default function SinAcceso() {
  return (
    <main className="public">
      <h1>Tu cuenta no está en el equipo</h1>
      <p className="muted">
        Iniciaste sesión, pero tu correo todavía no está dado de alta como miembro del equipo, o fue desactivado.
        Pídele al administrador que te agregue en la sección Equipo.
      </p>
      <form action={logout}><button type="submit" className="ghost">Cerrar sesión</button></form>
    </main>
  );
}
