"use client";

import { useEffect, useRef } from "react";
import { AplicarForm } from "@/app/(embudo)/aplicar/form";
import { rastrear } from "@/components/rastreo";

// Aplicar sin salir de la página: los botones "Aplicar" abren este diálogo.
// Sin JavaScript, los mismos botones siguen llevando a /aplicar.
export function AplicarModal() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const abrir = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="/aplicar"]');
      if (!a || e.metaKey || e.ctrlKey || !ref.current) return;
      e.preventDefault();
      e.stopPropagation(); // antes de que el Link de Next navegue
      ref.current.showModal();
      document.documentElement.classList.add("modal-abierto");
      // stopPropagation también frena el rastreo de clics, así que se registra aquí.
      const ev = a.getAttribute("data-evento");
      if (ev) rastrear(ev);
      rastrear("aplicar_vista");
    };
    document.addEventListener("click", abrir, true);
    return () => document.removeEventListener("click", abrir, true);
  }, []);

  const cerrar = () => { ref.current?.close(); };

  return (
    <dialog
      ref={ref} className="modal" aria-labelledby="modal-titulo"
      onClose={() => document.documentElement.classList.remove("modal-abierto")}
      onClick={(e) => { if (e.target === ref.current) cerrar(); }}
    >
      <div className="modal-in">
        <button type="button" className="modal-x" onClick={cerrar} aria-label="Cerrar">×</button>
        <p className="eyebrow">Paso 1 de 2</p>
        <h2 id="modal-titulo" className="lp-h2" style={{ fontSize: 28 }}>Cuéntanos de tu proyecto</h2>
        <p className="muted">Cuatro preguntas rápidas. En el siguiente paso eliges el horario de tu llamada.</p>
        <AplicarForm />
      </div>
    </dialog>
  );
}
