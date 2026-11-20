"use client";

import { useRef, useState } from "react";

// La historia de Fer como un rollo de película en 3D: cada capítulo es una escena.
// Texto basado solo en lo que contó Fernanda (19-nov-2026); sin fechas inventadas salvo 2018.
const ESCENAS = [
  { tag: "Escena 1", titulo: "Estudié cine", texto: "Aprendí a contar historias con imagen, luz y ritmo. Sin saberlo, ahí empezó todo." },
  { tag: "2018", titulo: "El mundo de las marcas", texto: "Empecé a hacer videos y contenido para marcas. Entendí que una marca se vende cuando se siente." },
  { tag: "Escena 3", titulo: "Monté Conexión", texto: "Una agencia de contenidos. Le puse todo… y fracasó. Ese mismo tiempo, también me separé." },
  { tag: "Escena 4", titulo: "Me puse a aprender", texto: "Salí de mi ciudad. Aprendí a viajar y a trabajar al mismo tiempo: Medellín, México, y todo lo que me enseñó el camino." },
  { tag: "Escena 5", titulo: "Me partí la clavícula", texto: "Y seguí trabajando. Descubrí que la constancia también es una forma de creatividad." },
  { tag: "Escena 6", titulo: "Detrás de las grandes marcas", texto: "Estuve detrás de marcas y personas que venden en Latinoamérica, España y el mundo. Vi lo que funciona por dentro." },
  { tag: "Escena 7", titulo: "Liderar desde la estrategia", texto: "Lideré equipos desde la estrategia de comunicación y la estructura organizacional, dentro de las estrategias de marca." },
  { tag: "Hoy", titulo: "Conexión 2.0", texto: "Un equipo de expertos en IA entre Colombia y México. Los secretos de las grandes marcas, con un enfoque creativo y humano, para la tuya." },
];

export function Historia() {
  const [i, setI] = useState(0);
  const inicio = useRef<number | null>(null);
  const ir = (n: number) => setI(Math.max(0, Math.min(ESCENAS.length - 1, n)));

  return (
    <div
      className="rollo" role="region" aria-roledescription="carrusel" aria-label="La historia de Fer" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "ArrowRight") ir(i + 1); if (e.key === "ArrowLeft") ir(i - 1); }}
      onPointerDown={(e) => { inicio.current = e.clientX; }}
      onPointerUp={(e) => {
        if (inicio.current === null) return;
        const dx = e.clientX - inicio.current; inicio.current = null;
        if (Math.abs(dx) > 40) ir(i + (dx < 0 ? 1 : -1));
      }}
    >
      <div className="rollo-escena">
        {ESCENAS.map((s, k) => {
          const d = k - i;
          const lejos = Math.abs(d) > 2;
          return (
            <article
              key={s.titulo} className={`cuadro${d === 0 ? " on" : ""}`} aria-hidden={d !== 0}
              onClick={() => d !== 0 && ir(k)}
              style={{
                transform: `translateX(${d * 74}%) translateZ(${-Math.abs(d) * 180}px) rotateY(${d * -30}deg)`,
                opacity: lejos ? 0 : 1 - Math.abs(d) * 0.28,
                zIndex: 10 - Math.abs(d),
                pointerEvents: lejos ? "none" : "auto",
              }}
            >
              <div className="cuadro-perf" aria-hidden="true" />
              <div className="cuadro-in">
                <span className="cuadro-tag">{s.tag}</span>
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </div>
              <div className="cuadro-perf" aria-hidden="true" />
            </article>
          );
        })}
      </div>
      <div className="rollo-ctrl">
        <button type="button" className="ghost rollo-btn" onClick={() => ir(i - 1)} disabled={i === 0} aria-label="Escena anterior">←</button>
        <div className="rollo-puntos" aria-hidden="true">
          {ESCENAS.map((_, k) => <span key={k} className={k === i ? "on" : ""} />)}
        </div>
        <button type="button" className="ghost rollo-btn" onClick={() => ir(i + 1)} disabled={i === ESCENAS.length - 1} aria-label="Escena siguiente">→</button>
      </div>
      <p className="sr-only" aria-live="polite">{ESCENAS[i].tag}: {ESCENAS[i].titulo}. {ESCENAS[i].texto}</p>
    </div>
  );
}
