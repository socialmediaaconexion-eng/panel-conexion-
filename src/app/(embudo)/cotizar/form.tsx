"use client";

import { useActionState } from "react";
import { crearCotizacion } from "./actions";
import { PIEZAS } from "@/lib/cotizaciones";
import { CamposRastreo } from "@/components/rastreo";

export function CotizarForm() {
  const [error, action, pending] = useActionState(crearCotizacion, null);
  return (
    <form action={action} className="cotizar" data-rastreo>
      <CamposRastreo />
      <input type="text" name="empresa_web" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />

      <fieldset className="piezas">
        <legend>¿Qué quieres cotizar?</legend>
        {PIEZAS.map((p, i) => (
          <label key={p} className="pieza" htmlFor={`pz-${i}`}>
            <input id={`pz-${i}`} type="checkbox" name="piezas" value={p} />
            <span>{p}</span>
          </label>
        ))}
      </fieldset>

      <div className="cotizar-grid">
        <label htmlFor="c-nombre">Nombre<input id="c-nombre" name="nombre" required autoComplete="name" /></label>
        <label htmlFor="c-email">Correo<input id="c-email" name="email" type="email" required autoComplete="email" /></label>
        <label htmlFor="c-tel">WhatsApp<input id="c-tel" name="telefono" type="tel" placeholder="+57 300 000 0000" autoComplete="tel" /></label>
        <label htmlFor="c-empresa">Marca o empresa<input id="c-empresa" name="empresa" autoComplete="organization" /></label>
        <label htmlFor="c-pais">País<input id="c-pais" name="pais" autoComplete="country-name" /></label>
        <label htmlFor="c-presupuesto">Presupuesto aproximado
          <select id="c-presupuesto" name="presupuesto" defaultValue="">
            <option value="">Prefiero no decirlo</option>
            <option>Menos de $500 USD</option>
            <option>$500 – $1,500 USD</option>
            <option>$1,500 – $5,000 USD</option>
            <option>Más de $5,000 USD</option>
          </select>
        </label>
        <label htmlFor="c-plazo">¿Para cuándo?
          <select id="c-plazo" name="plazo" defaultValue="">
            <option value="">Sin fecha definida</option>
            <option>Lo antes posible</option>
            <option>En el próximo mes</option>
            <option>En 2–3 meses</option>
          </select>
        </label>
      </div>
      <label htmlFor="c-msg">Cuéntanos de tu proyecto (opcional)<textarea id="c-msg" name="mensaje" rows={4} placeholder="Qué vendes, a quién, qué tienes hoy y qué te gustaría lograr." /></label>

      {error && <div className="alert error">{error}</div>}
      <button type="submit" className="btn-big" disabled={pending}>{pending ? "Enviando…" : "Pedir mi cotización"}</button>
      <p className="muted small">Te llega una confirmación al correo y te respondemos con la propuesta. Al enviar aceptas nuestra <a href="/privacidad">política de privacidad</a>.</p>
    </form>
  );
}
