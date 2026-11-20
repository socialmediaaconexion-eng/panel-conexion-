"use client";

import { useRef } from "react";

export type Cliente = { nombre: string; foto: string; rol?: string };

// Fila de tarjetas altas en blanco y negro con el nombre abajo (se colorean al pasar el mouse).
// Se desliza con el dedo, con la rueda/trackpad o arrastrando con el mouse.
export function Clientes({ clientes }: { clientes: Cliente[] }) {
  const fila = useRef<HTMLDivElement>(null);
  const arrastre = useRef<{ x: number; scroll: number } | null>(null);
  if (clientes.length === 0) return null;

  const mover = (dir: number) => fila.current?.scrollBy({ left: dir * fila.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="clientes">
      <div
        ref={fila} className="clientes-fila" role="list" aria-label="Personas y marcas con las que he trabajado"
        onPointerDown={(e) => { if (e.pointerType === "mouse" && fila.current) arrastre.current = { x: e.clientX, scroll: fila.current.scrollLeft }; }}
        onPointerMove={(e) => { if (arrastre.current && fila.current) fila.current.scrollLeft = arrastre.current.scroll - (e.clientX - arrastre.current.x); }}
        onPointerUp={() => { arrastre.current = null; }}
        onPointerLeave={() => { arrastre.current = null; }}
      >
        {clientes.map((c) => {
          const [uno, ...resto] = c.nombre.split(" ");
          return (
            <figure key={c.nombre} className="cliente" role="listitem">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.foto} alt={c.nombre} loading="lazy" draggable={false} />
              <figcaption>
                <strong>{uno}<br />{resto.join(" ")}</strong>
                {c.rol && <span>{c.rol}</span>}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="clientes-ctrl">
        <button type="button" className="ghost rollo-btn" onClick={() => mover(-1)} aria-label="Ver anteriores">←</button>
        <button type="button" className="ghost rollo-btn" onClick={() => mover(1)} aria-label="Ver siguientes">→</button>
      </div>
    </div>
  );
}
