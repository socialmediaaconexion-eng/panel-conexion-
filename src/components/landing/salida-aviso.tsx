"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// Aviso de salida (solo computador, una vez por sesión): cuando el mouse sale por arriba de la ventana.
export function SalidaAviso({ href }: { href: string }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let armado = false;
    const armar = setTimeout(() => { armado = true; }, 8000); // no molestar a quien acaba de llegar
    const salir = (e: MouseEvent) => {
      if (!armado || e.clientY > 0 || e.relatedTarget) return;
      try { if (sessionStorage.getItem("cx-salida")) return; sessionStorage.setItem("cx-salida", "1"); } catch {}
      if (document.querySelector("dialog[open]")) return;
      ref.current?.showModal();
    };
    document.addEventListener("mouseout", salir);
    return () => { clearTimeout(armar); document.removeEventListener("mouseout", salir); };
  }, []);

  return (
    <dialog ref={ref} className="modal modal-salida" aria-labelledby="salida-titulo" onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <div className="modal-in" style={{ textAlign: "center", alignItems: "center" }}>
        <button type="button" className="modal-x" onClick={() => ref.current?.close()} aria-label="Cerrar">×</button>
        <p className="eyebrow">Antes de irte</p>
        <h2 id="salida-titulo" className="lp-h2" style={{ fontSize: 28 }}>Abrimos pocas plazas al mes</h2>
        <p className="muted">Son 5 preguntas de un toque y el diagnóstico es gratuito. Si no somos para ti, te lo decimos.</p>
        <Link href={href} className="btn btn-big" onClick={() => ref.current?.close()} data-evento="cta_aplicar">Quiero saber si es para mí</Link>
        <button type="button" className="ghost" onClick={() => ref.current?.close()}>Seguir viendo la página</button>
      </div>
    </dialog>
  );
}
