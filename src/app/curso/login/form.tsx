"use client";

import { useActionState, useState } from "react";
import { entrarCurso, recuperarClave } from "./actions";

export function LoginCursoForm() {
  const [modo, setModo] = useState<"entrar" | "recuperar">("entrar");
  const [estado, entrar, entrando] = useActionState(entrarCurso, null);
  const [rec, recuperar, enviando] = useActionState(recuperarClave, null);

  if (modo === "recuperar") {
    return (
      <form action={recuperar} className="stack">
        <p className="muted" style={{ margin: 0 }}>Escribe el correo con el que compraste y te enviamos un enlace para crear una contraseña nueva.</p>
        <label htmlFor="r-email">Correo
          <input id="r-email" name="email" type="email" required autoComplete="email" inputMode="email" />
        </label>
        {rec?.error && <div className="alert error" role="alert">{rec.error}</div>}
        {rec?.ok && <div className="alert ok" role="status">{rec.ok}</div>}
        <button type="submit" disabled={enviando}>{enviando ? "Enviando…" : "Enviarme el enlace"}</button>
        <button type="button" className="ghost" onClick={() => setModo("entrar")}>Volver a entrar</button>
      </form>
    );
  }

  return (
    <form action={entrar} className="stack">
      <label htmlFor="email">Correo
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" />
      </label>
      <label htmlFor="password">Contraseña
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </label>
      {estado?.error && <div className="alert error" role="alert">{estado.error}</div>}
      <button type="submit" disabled={entrando}>{entrando ? "Entrando…" : "Entrar a mi curso"}</button>
      <button type="button" className="alu-link" onClick={() => setModo("recuperar")}>Olvidé mi contraseña</button>
    </form>
  );
}
