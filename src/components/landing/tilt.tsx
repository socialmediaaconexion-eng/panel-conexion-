"use client";

import { useRef } from "react";

// Tarjeta con inclinación 3D que sigue el puntero (solo con mouse; en celular queda quieta).
export function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  function mover(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
    ref.current.style.setProperty("--mx", `${((x + 0.5) * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--my", `${((y + 0.5) * 100).toFixed(1)}%`);
  }
  function salir() {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  }
  return (
    <div ref={ref} className={`tilt ${className}`} onPointerMove={mover} onPointerLeave={salir}>
      {children}
    </div>
  );
}
