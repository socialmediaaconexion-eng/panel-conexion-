import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { cambiarClave } from "./actions";

export default function NuevaClave() {
  return (
    <>
      <Link href="/curso" className="alu-volver">← Mis cursos</Link>
      <h1 className="alu-h1">Cambiar contraseña</h1>
      <p className="muted" style={{ marginTop: 0 }}>Elige una contraseña que recuerdes. Mínimo 8 caracteres.</p>
      <div className="alu-card">
        <ActionForm action={cambiarClave} submit="Guardar contraseña">
          <label htmlFor="clave">Contraseña nueva<input id="clave" name="clave" type="password" required minLength={8} autoComplete="new-password" /></label>
          <label htmlFor="repetir">Repite la contraseña<input id="repetir" name="repetir" type="password" required minLength={8} autoComplete="new-password" /></label>
        </ActionForm>
      </div>
    </>
  );
}
