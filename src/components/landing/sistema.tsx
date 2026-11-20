"use client";

import { useEffect, useState } from "react";

// Las 5 piezas del sistema en el orden real de trabajo: guion → videos → landing → campañas → panel. Avanza sola hasta que la persona toca una.
const PIEZAS = [
  { id: "guion", nombre: "Guion", corto: "Estrategia", texto: "Partimos de tu estrategia de marca: qué decir, a quién y en qué orden. Guionizamos tu VSL y tus piezas antes de grabar nada." },
  { id: "videos", nombre: "Videos", corto: "Graban y editan", texto: "Grabamos y editamos con motion graphics y subtítulos: tu VSL y contenido que explican tu oferta con tu voz." },
  { id: "landing", nombre: "Landing", corto: "Convierte", texto: "Una página con tu identidad que convierte la visita en una aplicación, en celular y en computador." },
  { id: "campanas", nombre: "Campañas", corto: "Atraen", texto: "Con el guion, los videos y la landing listos, lanzamos anuncios en Meta para atraer a la persona correcta, y medimos cada clic hasta la venta." },
  { id: "panel", nombre: "Panel", corto: "Ordena y mide", texto: "Embudo con agenda automática y tu panel: cada lead, cita, venta y alerta en tu celular, con la analítica paso a paso." },
] as const;

export function Sistema() {
  const [activa, setActiva] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setActiva((a) => (a + 1) % PIEZAS.length), 3800);
    return () => clearInterval(t);
  }, [auto]);

  const elegir = (i: number) => { setAuto(false); setActiva(i); };
  const p = PIEZAS[activa];

  return (
    <div className="sis">
      <div className="sis-ruta" role="tablist" aria-label="Piezas del sistema">
        <svg className="sis-linea" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <line x1="100" y1="20" x2="900" y2="20" className="sis-linea-base" />
          <line x1="100" y1="20" x2="900" y2="20" className="sis-linea-flujo" />
        </svg>
        <span className="sis-lead" aria-hidden="true" style={{ left: `${10 + activa * 20}%` }} />
        {PIEZAS.map((x, i) => (
          <button
            key={x.id} type="button" role="tab" aria-selected={i === activa} aria-controls="sis-detalle"
            className={`sis-nodo${i === activa ? " on" : ""}${i < activa ? " pasado" : ""}`} onClick={() => elegir(i)}
          >
            <span className="sis-punto" aria-hidden="true">{i + 1}</span>
            <span className="sis-nombre">{x.nombre}</span>
            <span className="sis-corto">{x.corto}</span>
          </button>
        ))}
      </div>
      <div id="sis-detalle" role="tabpanel" className="sis-detalle" key={p.id}>
        <span className="sis-ia">IA en cada pieza</span>
        <h3>{p.nombre}</h3>
        <p>{p.texto}</p>
      </div>
    </div>
  );
}
