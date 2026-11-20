"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";
import type { EstadoCred } from "./actions";

const SECCIONES = [
  { href: "/panel/workshop", label: "Ventas" },
  { href: "/panel/workshop/alumnos", label: "Alumnos" },
  { href: "/panel/workshop/embudo", label: "Embudo" },
  { href: "/panel/workshop/contenido", label: "Contenido" },
];

export function SubNav() {
  const path = usePathname();
  return (
    <nav className="row ws-subnav" aria-label="Secciones del workshop">
      {SECCIONES.map((s) => (
        <Link key={s.href} href={s.href} className={`pill ${path === s.href ? "red" : ""}`}>{s.label}</Link>
      ))}
    </nav>
  );
}

function Copiar({ texto, label }: { texto: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="ghost small" onClick={async () => {
      try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1800); } catch { window.prompt("Copia:", texto); }
    }}>{ok ? "Copiado ✓" : label}</button>
  );
}

// Formulario que muestra las credenciales creadas para copiarlas o mandarlas por WhatsApp.
export function CredForm({ action, submit, children, className = "stack", fantasma = false }: {
  action: (prev: EstadoCred, f: FormData) => Promise<EstadoCred>;
  submit: string; children?: React.ReactNode; className?: string; fantasma?: boolean;
}) {
  const [st, formAction, pending] = useActionState(action, null);
  const c = st?.credenciales;
  const mensaje = c ? `Hola, este es tu acceso a ALMA by Conexión:\n${c.url}\nUsuario: ${c.correo}\n${c.clave ? `Contraseña: ${c.clave}\n(Cámbiala al entrar: menú → Cambiar contraseña)` : "Contraseña: la que ya tienes (si no la recuerdas, toca «Olvidé mi contraseña»)."}` : "";
  const wa = c && st?.whatsapp ? `https://wa.me/${st.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}` : null;
  return (
    <form action={formAction} className={className}>
      {children}
      <button type="submit" className={fantasma ? "ghost small" : undefined} disabled={pending}>{pending ? "Procesando…" : submit}</button>
      {st?.error && <div className="alert error" role="alert">{st.error}</div>}
      {st?.ok && !c && <div className="alert ok" role="status">{st.ok}</div>}
      {c && (
        <div className="alert ok ws-cred" role="status">
          <strong>{st?.ok}</strong>
          <div>Entrar: <code>{c.url}</code></div>
          <div>Usuario: <code>{c.correo}</code></div>
          <div>Contraseña: {c.clave ? <code>{c.clave}</code> : <em>la que el alumno ya tenía</em>}</div>
          <div className="muted small">Correo: {c.envio}</div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            <Copiar texto={mensaje} label="Copiar credenciales" />
            {wa && <a className="pill" href={wa} target="_blank" rel="noopener">Enviar por WhatsApp</a>}
          </div>
        </div>
      )}
    </form>
  );
}

// Botón de un formulario de acción que pide confirmación antes de enviar.
export function Confirmar({ action, texto, pregunta }: { action: () => Promise<void>; texto: string; pregunta: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(pregunta)) e.preventDefault(); }}>
      <button type="submit" className="ghost small">{texto}</button>
    </form>
  );
}
