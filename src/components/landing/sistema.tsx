"use client";

import { useEffect, useState } from "react";

// Las 5 piezas del sistema de captación, conectadas. Avanza sola hasta que la persona toca una.
const PIEZAS = [
  { id: "campanas", nombre: "Campañas", corto: "Atraen", texto: "Anuncios en Meta pensados para atraer a la persona correcta, no a cualquiera. Medimos cada clic hasta la venta." },
  { id: "videos", nombre: "Videos", corto: "Explican", texto: "Tu VSL y piezas de contenido que explican tu oferta con tu voz, para que la llamada empiece con confianza." },
  { id: "landing", nombre: "Landing", corto: "Convierte", texto: "Una página con tu identidad que convierte la visita en una aplicación, en celular y en computador." },
  { id: "embudo", nombre: "Embudo", corto: "Filtra y agenda", texto: "Preguntas que califican, agenda automática con tu equipo y recordatorios por correo y WhatsApp." },
  { id: "panel", nombre: "Panel", corto: "Ordena y mide", texto: "Tu equipo ve cada lead, cita y venta en un solo lugar, con la analítica del embudo paso a paso." },
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
