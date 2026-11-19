"use client";

import { useActionState } from "react";

export function AgendaForm({
  action,
  dias,
}: {
  action: (prev: string | null, formData: FormData) => Promise<string | null>;
  dias: [string, { iso: string; label: string }[]][];
}) {
  const [error, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="embudo-form">
      {dias.map(([d, horas]) => (
        <fieldset key={d} className="slots">
          <legend>{d}</legend>
          {horas.map((h) => (
            <label key={h.iso} className="slot">
              <input type="radio" name="slot" value={h.iso} required />
              <span>{h.label}</span>
            </label>
          ))}
        </fieldset>
      ))}
      {error && <div className="alert error" role="alert">{error}</div>}
      <button type="submit" className="btn-big" disabled={pending}>{pending ? "Agendando…" : "Confirmar mi llamada"}</button>
    </form>
  );
}
