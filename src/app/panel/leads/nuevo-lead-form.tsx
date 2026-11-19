"use client";

import { useActionState } from "react";
import { crearLead } from "./actions";

export function NuevoLeadForm() {
  const [state, action, pending] = useActionState(crearLead, null);
  return (
    <form action={action} className="stack">
      <label htmlFor="nl-nombre">Nombre<input id="nl-nombre" name="nombre" required /></label>
      <label htmlFor="nl-email">Correo<input id="nl-email" name="email" type="email" required /></label>
      <label htmlFor="nl-tel">WhatsApp (con código de país)<input id="nl-tel" name="telefono" placeholder="+57 300 000 0000" /></label>
      <label htmlFor="nl-embudo">Embudo / origen<input id="nl-embudo" name="embudo" placeholder="manual" /></label>
      <label htmlFor="nl-notas">Notas<textarea id="nl-notas" name="notas" rows={3} /></label>
      {state?.error && <div className="alert error">{state.error}</div>}
      <button type="submit" disabled={pending}>{pending ? "Guardando…" : "Agregar lead"}</button>
    </form>
  );
}
