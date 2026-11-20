"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Barra fija inferior del workshop: aparece tras casi una pantalla de scroll y se oculta en la sección de precio.
export function CtaFija({ href, texto, boton }: { href: string; texto: string; boton: string }) {
  const [ver, setVer] = useState(false);
  useEffect(() => {
    const precio = document.getElementById("precio");
    const f = () => {
      const pasado = window.scrollY > window.innerHeight * 0.8;
      const r = precio?.getBoundingClientRect();
      const enPrecio = r ? r.top < window.innerHeight && r.bottom > 0 : false;
      setVer(pasado && !enPrecio);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`sticky-cta${ver ? " ver" : ""}`} aria-hidden={!ver}>
      <span>{texto}</span>
      <Link href={href} className="btn" data-evento="workshop_cta" tabIndex={ver ? 0 : -1}>{boton}</Link>
    </div>
  );
}
