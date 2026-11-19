"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <main className="public"><div className="public-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dorado.png" alt="Conexión" />
      <h1>Entrar al panel</h1>
      <p className="muted">Usa el correo y la contraseña que te dio el administrador.</p>
      <form action={action} className="stack">
        <label htmlFor="email">Correo
          <input id="email" name="email" type="email" required autoComplete="email" />
        </label>
        <label htmlFor="password">Contraseña
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
      </form>
    </div></main>
  );
}
