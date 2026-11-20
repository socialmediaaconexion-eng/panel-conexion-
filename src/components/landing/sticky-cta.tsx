"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Barra fija inferior que aparece después de casi una pantalla de scroll y se oculta al llegar al cierre.
export function StickyCta({ href }: { href: string }) {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const cierre = document.getElementById("aplicar");
    const f = () => {
      const pasado = window.scrollY > window.innerHeight * 0.9;
      const enCierre = cierre ? cierre.getBoundingClientRect().top < window.innerHeight : false;
      setVer(pasado && !enCierre);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`sticky-cta${ver ? " ver" : ""}`} aria-hidden={!ver}>
      <span>Diagnóstico gratuito · 45 min</span>
      <Link href={href} className="btn" data-evento="cta_aplicar" tabIndex={ver ? 0 : -1}>¿Soy apto?</Link>
    </div>
  );
}
