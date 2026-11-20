"use client";

import { useEffect, useRef, useState } from "react";

// Tarjeta negra del teléfono de demostración (ilustración, no datos reales):
// el número de ventas sube contando y la línea de crecimiento se dibuja como un tallo que crece, con un punto que late en la punta.
const META = 128;

export function TelVentas() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setActivo(true);
      if (reducido) { setN(META); return; }
      const t0 = performance.now(), dur = 1800;
      const paso = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        setN(Math.round(META * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} className={`tel-ventas${activo ? " on" : ""}`}>
      <div className="tv-cab">
        <small>Ventas este mes</small>
        <span className="tv-chip">▲ 32 %</span>
      </div>
      <b className="tv-num">{n}</b>
      <svg className="tv-linea" viewBox="0 0 200 56" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="tv-g" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fc1e2a" stopOpacity=".35" />
            <stop offset="1" stopColor="#ff4a54" />
          </linearGradient>
          <linearGradient id="tv-a" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fc1e2a" stopOpacity=".28" />
            <stop offset="1" stopColor="#fc1e2a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="tv-area" d="M0 50 C 30 48, 40 40, 62 38 S 98 34, 112 26 S 150 20, 166 12 S 190 6, 196 4 L 196 56 L 0 56 Z" fill="url(#tv-a)" />
        <path className="tv-trazo" d="M0 50 C 30 48, 40 40, 62 38 S 98 34, 112 26 S 150 20, 166 12 S 190 6, 196 4" fill="none" stroke="url(#tv-g)" strokeWidth="2.6" strokeLinecap="round" pathLength={1} />
      </svg>
      <i className="tv-punto" />
    </div>
  );
}
