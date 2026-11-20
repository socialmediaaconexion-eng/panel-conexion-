"use client";

import { useActionState, useState } from "react";
import { aplicar } from "../actions";
import { CamposRastreo } from "@/components/rastreo";
import { PREGUNTAS } from "@/lib/preguntas";

// Formulario por pasos: una pregunta por pantalla, un toque por respuesta, contacto al final.
export function AplicarForm() {
  const [error, action, pending] = useActionState(aplicar, null);
  const [paso, setPaso] = useState(0);
  const [resp, setResp] = useState<Record<string, string>>({});
  const total = PREGUNTAS.length + 1;
  const enContacto = paso === PREGUNTAS.length;

  function elegir(id: string, valor: string) {
    setResp((r) => ({ ...r, [id]: valor }));
    setTimeout(() => setPaso((p) => p + 1), 180);
  }

  return (
    <form action={action} className="quiz" data-rastreo>
      <CamposRastreo />
      {PREGUNTAS.map((q) => <input key={q.id} type="hidden" name={q.id} value={resp[q.id] ?? ""} />)}

      <div className="quiz-top">
        {paso > 0 ? <button type="button" className="quiz-atras" onClick={() => setPaso(paso - 1)}>← Atrás</button> : <span />}
        <span className="muted small">{paso + 1} de {total}</span>
      </div>
      <div className="quiz-barra" aria-hidden="true"><span style={{ width: `${((paso + 1) / total) * 100}%` }} /></div>

      {!enContacto && (() => {
        const q = PREGUNTAS[paso];
        return (
          <fieldset key={q.id} className="quiz-paso">
            <legend>{q.titulo}</legend>
            <p className="muted small">{q.ayuda}</p>
            <div className="quiz-opciones">
              {q.opciones.map((o) => (
                <button key={o} type="button" className={`quiz-op${resp[q.id] === o ? " on" : ""}`} onClick={() => elegir(q.id, o)}>{o}</button>
              ))}
            </div>
          </fieldset>
        );
      })()}

      <fieldset className="quiz-paso" hidden={!enContacto}>
        <legend>Último paso: ¿a dónde te escribimos?</legend>
        <p className="muted small">Revisamos tus respuestas y, si esto es para ti, eliges el horario de tu llamada gratuita.</p>
        <label htmlFor="a-nombre">Nombre<input id="a-nombre" name="nombre" required autoComplete="name" /></label>
        <label htmlFor="a-email">Correo<input id="a-email" name="email" type="email" required autoComplete="email" /></label>
        <label htmlFor="a-tel">WhatsApp (con código de país)<input id="a-tel" name="telefono" type="tel" required placeholder="+57 300 000 0000" autoComplete="tel" /></label>
        {error && <div className="alert error" role="alert">{error}</div>}
        <button type="submit" className="btn-big" disabled={pending}>{pending ? "Revisando…" : "Ver si es para mí y agendar"}</button>
        <p className="muted small">Al enviar aceptas nuestra <a href="/privacidad">política de privacidad</a>.</p>
      </fieldset>
    </form>
  );
}
