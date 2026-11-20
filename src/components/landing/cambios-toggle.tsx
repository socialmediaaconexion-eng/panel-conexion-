"use client";

import { useState } from "react";

// "Lo que cambia": un interruptor Antes / Con Conexión. Una idea por fila, íconos claros,
// sin texto tachado difícil de leer, apto para quien escanea rápido o prefiere menos estímulo.
const FILAS: [string, string, string][] = [
  ["🧩", "Piezas sueltas: una página por aquí, un video por allá", "Un sistema conectado de punta a punta"],
  ["💬", "Los leads se pierden en el WhatsApp", "Cada lead con dueño, cita y seguimiento"],
  ["📣", "Pagas anuncios a ciegas", "Sabes qué anuncio te trae cada venta"],
  ["📅", "Agendas a mano y la gente no llega", "Agenda automática con recordatorios"],
  ["🎬", "Contenido bonito sin estrategia", "Videos con tu voz que venden tu oferta"],
  ["🧭", "Todo depende de ti", "Un proceso claro que tu equipo sigue"],
];

export function CambiosToggle() {
  const [con, setCon] = useState(true);
  return (
    <div className="ct">
      <div className="ct-switch" role="radiogroup" aria-label="Ver cómo es tu negocio">
        <button type="button" role="radio" aria-checked={!con} className={!con ? "on" : ""} onClick={() => setCon(false)}>Antes</button>
        <button type="button" role="radio" aria-checked={con} className={con ? "on" : ""} onClick={() => setCon(true)}>Con Conexión</button>
        <span className={`ct-pastilla${con ? " der" : ""}`} aria-hidden="true" />
      </div>
      <ul className={`ct-lista${con ? " con" : " antes"}`} aria-live="polite">
        {FILAS.map(([ico, antes, despues]) => (
          <li key={antes}>
            <span className="ct-ico" aria-hidden="true">{ico}</span>
            <span className="ct-texto">{con ? despues : antes}</span>
            <span className="ct-estado" aria-hidden="true">{con ? "✓" : "✕"}</span>
          </li>
        ))}
      </ul>
      <p className="ct-ayuda">Toca <strong>{con ? "Antes" : "Con Conexión"}</strong> para comparar.</p>
    </div>
  );
}
