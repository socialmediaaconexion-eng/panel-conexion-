"use client";

import { useEffect, useRef } from "react";

// Textura animada del inicio: ondas de frecuencia + barras de ecualizador en dorado, con baja opacidad.
// Canvas 2D liviano; se pausa fuera de pantalla y queda quieto con "reducir movimiento".
export function Ondas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const medir = () => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const dibujar = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const s = t / 1000;
      // Ondas de frecuencia (líneas finas que respiran)
      for (let k = 0; k < 7; k++) {
        ctx.beginPath();
        const amp = h * (0.05 + k * 0.018) * (0.75 + 0.25 * Math.sin(s * 0.9 + k));
        const fase = s * (0.5 + k * 0.12) + k * 1.3;
        for (let x = 0; x <= w; x += 6) {
          const y = h * 0.55 + Math.sin(x * 0.006 + fase) * amp + Math.sin(x * 0.017 - fase * 1.6) * amp * 0.35;
          k === 0 && x === 0 ? ctx.moveTo(x, y) : x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, "rgba(201,162,74,0)");
        g.addColorStop(0.5, `rgba(214,175,85,${0.32 - k * 0.035})`);
        g.addColorStop(1, "rgba(201,162,74,0)");
        ctx.strokeStyle = g; ctx.lineWidth = k === 0 ? 1.6 : 1; ctx.stroke();
      }
      // Ecualizador abajo (barras que suben y bajan)
      const n = Math.max(24, Math.floor(w / 18));
      const bw = w / n;
      for (let i = 0; i < n; i++) {
        const v = 0.5 + 0.5 * Math.sin(s * 2.2 + i * 0.55) * Math.sin(s * 0.7 + i * 0.13);
        const bh = h * 0.08 + v * h * 0.16;
        const centro = 1 - Math.abs(i / n - 0.5) * 2;
        ctx.fillStyle = `rgba(214,175,85,${0.05 + centro * 0.16})`;
        ctx.beginPath();
        ctx.roundRect(i * bw + bw * 0.3, h - bh, bw * 0.4, bh, bw * 0.2);
        ctx.fill();
      }
      // Partículas tipo "píxeles" de videojuego
      for (let i = 0; i < 26; i++) {
        const x = ((i * 137.5 + s * (12 + (i % 5) * 6)) % (w + 40)) - 20;
        const y = (h * ((i * 0.618) % 1) + Math.sin(s + i) * 10);
        ctx.fillStyle = `rgba(214,175,85,${0.12 + (i % 3) * 0.06})`;
        ctx.fillRect(x, y, 2 + (i % 3), 2 + (i % 3));
      }
    };

    const loop = (t: number) => { if (visible) dibujar(t); raf = requestAnimationFrame(loop); };
    medir();
    if (quieto) dibujar(0); else raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(cv);
    window.addEventListener("resize", medir);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", medir); };
  }, []);

  return <canvas ref={ref} className="ondas" aria-hidden="true" />;
}
