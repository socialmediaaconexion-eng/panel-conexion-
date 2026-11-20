"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TemaToggle } from "@/components/tema-toggle";

// Navegación del panel en el celular (y como app instalada): barra superior + pestañas abajo + hoja "Más".
const I = {
  resumen: <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />,
  leads: <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 1c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4ZM8 14c-.3 0-.7 0-1.1.1A5 5 0 0 1 9 17v3H1v-2.5C1 15.6 5.2 14 8 14Z" />,
  citas: <path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8H5v10h14V10Z" />,
  ventas: <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15.9V19h-2v-1.1c-1.7-.3-3-1.4-3.1-3h2c.1.9.9 1.5 2.1 1.5 1.3 0 2-.6 2-1.4s-.6-1.2-2.4-1.6c-2-.5-3.4-1.2-3.4-3 0-1.4 1.1-2.4 2.8-2.8V6.5h2v1.1c1.6.3 2.6 1.4 2.7 2.9h-2c-.1-.8-.7-1.4-1.8-1.4s-1.8.5-1.8 1.3.7 1.1 2.4 1.5c2 .5 3.4 1.2 3.4 3.1 0 1.5-1.2 2.6-2.9 2.9Z" />,
  mas: <path d="M5 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z" />,
};
const Ico = ({ d }: { d: React.ReactNode }) => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">{d}</svg>;

const TABS = [
  { href: "/panel", label: "Resumen", ico: I.resumen },
  { href: "/panel/leads", label: "Leads", ico: I.leads },
  { href: "/panel/citas", label: "Citas", ico: I.citas },
  { href: "/panel/ventas", label: "Ventas", ico: I.ventas },
];
const MAS = [
  { href: "/panel/horarios", label: "Horarios", gestor: false },
  { href: "/panel/cotizaciones", label: "Cotizaciones", gestor: true },
  { href: "/panel/cobros", label: "Cobros", gestor: true },
  { href: "/panel/analitica", label: "Analítica", gestor: true },
  { href: "/panel/soporte", label: "Soporte", gestor: false },
  { href: "/panel/equipo", label: "Equipo", gestor: true },
];
const TITULOS: Record<string, string> = Object.fromEntries([...TABS, ...MAS].map((t) => [t.href, t.label]));

export function NavMovil({ esGestor, nombre, logout }: { esGestor: boolean; nombre: string; logout: () => Promise<void> }) {
  const path = usePathname();
  const [abierto, setAbierto] = useState(false);
  useEffect(() => { setAbierto(false); }, [path]);
  const activo = (h: string) => (h === "/panel" ? path === "/panel" : path.startsWith(h));
  const titulo = Object.entries(TITULOS).filter(([h]) => activo(h)).sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Panel";
  const masActivo = MAS.some((m) => activo(m.href));

  return (
    <>
      <header className="m-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" />
        <strong>{titulo}</strong>
        <span className="m-avatar" aria-hidden="true">{nombre.charAt(0)}</span>
      </header>

      <nav className="m-tabs" aria-label="Secciones del panel">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={activo(t.href) ? "on" : undefined}><Ico d={t.ico} /><span>{t.label}</span></Link>
        ))}
        <button type="button" className={masActivo || abierto ? "on" : undefined} onClick={() => setAbierto(!abierto)} aria-expanded={abierto}><Ico d={I.mas} /><span>Más</span></button>
      </nav>

      {abierto && <div className="m-velo" onClick={() => setAbierto(false)} aria-hidden="true" />}
      <div className={`m-hoja${abierto ? " on" : ""}`} role="dialog" aria-label="Más secciones" aria-hidden={!abierto}>
        <span className="m-asa" aria-hidden="true" />
        <div className="m-hoja-grid">
          {MAS.filter((m) => !m.gestor || esGestor).map((m) => (
            <Link key={m.href} href={m.href} className={activo(m.href) ? "on" : undefined} tabIndex={abierto ? 0 : -1}>{m.label}</Link>
          ))}
        </div>
        <div className="m-hoja-pie">
          <span className="muted small">{nombre}</span>
          <div className="row" style={{ gap: 8 }}>
            <TemaToggle />
            <form action={logout}><button type="submit" className="ghost small" tabIndex={abierto ? 0 : -1}>Cerrar sesión</button></form>
          </div>
        </div>
      </div>
    </>
  );
}
