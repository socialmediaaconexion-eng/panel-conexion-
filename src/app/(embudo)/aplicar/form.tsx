"use client";

import { useActionState } from "react";
import { aplicar } from "../actions";
import { CamposRastreo } from "@/components/rastreo";

export function AplicarForm() {
  const [error, action, pending] = useActionState(aplicar, null);
  return (
    <form action={action} className="stack embudo-form" data-rastreo>
      <CamposRastreo />
      <label htmlFor="a-nombre">Nombre completo<input id="a-nombre" name="nombre" required autoComplete="name" /></label>
      <label htmlFor="a-email">Correo<input id="a-email" name="email" type="email" required autoComplete="email" /></label>
      <label htmlFor="a-tel">WhatsApp (con código de país)<input id="a-tel" name="telefono" type="tel" required placeholder="+57 300 000 0000" autoComplete="tel" /></label>
      <label htmlFor="a-negocio">¿A qué se dedica tu negocio?<input id="a-negocio" name="negocio" required /></label>
      <label htmlFor="a-necesidad">¿Qué necesitas primero?
        <select id="a-necesidad" name="necesidad" required defaultValue="">
          <option value="" disabled>Elige una opción</option>
          <option>Manual de marca</option>
          <option>Diseños para ads y redes</option>
          <option>Landing page o funnel</option>
          <option>Varias de estas</option>
          <option>No estoy seguro todavía</option>
        </select>
      </label>
      <label htmlFor="a-inversion">¿Cuánto tienes pensado invertir en este proyecto?
        <select id="a-inversion" name="inversion" required defaultValue="">
          <option value="" disabled>Elige una opción</option>
          <option>Menos de $500 USD</option>
          <option>$500 – $1,500 USD</option>
          <option>$1,500 – $5,000 USD</option>
          <option>Más de $5,000 USD</option>
        </select>
      </label>
      <label htmlFor="a-cuando">¿Para cuándo lo necesitas?
        <select id="a-cuando" name="cuando" required defaultValue="">
          <option value="" disabled>Elige una opción</option>
          <option>Lo antes posible</option>
          <option>En el próximo mes</option>
          <option>En 2–3 meses</option>
          <option>Solo estoy explorando</option>
        </select>
      </label>
      {error && <div className="alert error" role="alert">{error}</div>}
      <button type="submit" className="btn-big" disabled={pending}>{pending ? "Enviando…" : "Continuar y elegir horario"}</button>
    </form>
  );
}
