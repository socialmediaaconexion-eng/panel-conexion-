"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/panel", label: "Resumen", gestor: false },
  { href: "/panel/leads", label: "Leads", gestor: false },
  { href: "/panel/citas", label: "Citas", gestor: false },
  { href: "/panel/ventas", label: "Ventas", gestor: false },
  { href: "/panel/horarios", label: "Horarios", gestor: false },
  { href: "/panel/cotizaciones", label: "Cotizaciones", gestor: true },
  { href: "/panel/analitica", label: "Analítica", gestor: true },
  { href: "/panel/soporte", label: "Soporte", gestor: false },
  { href: "/panel/equipo", label: "Equipo", gestor: true },
];

export function Nav({ esGestor }: { esGestor: boolean }) {
  const path = usePathname();
  return (
    <>
      {LINKS.filter((l) => !l.gestor || esGestor).map((l) => {
        const active = l.href === "/panel" ? path === "/panel" : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "active" : undefined}>
            {l.label}
          </Link>
        );
      })}
    </>
  );
}
