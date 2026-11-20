"use client";

import { useActionState, useState } from "react";
import { crearCobro } from "./actions";

// Planes de Conexión (precios dados por Fernanda, 19-nov-2026).
const PLANES = [
  { concepto: "Implementación sistema Conexión (pago único)", monto: "1800", moneda: "USD" },
  { concepto: "Suscripción mensual: contenido, campañas y panel", monto: "1500", moneda: "USD" },
  { concepto: "", monto: "", moneda: "USD" },
];

export function NuevoCobro() {
  const [estado, action, pending] = useActionState(crearCobro, null);
  const [plan, setPlan] = useState(0);
  const p = PLANES[plan];
  return (
    <form action={action} className="card cobro-form" key={plan}>
      <div className="row" style={{ gap: 8 }}>
        {["Implementación · USD 1.800", "Suscripción · USD 1.500", "Otro monto"].map((l, i) => (
          <button key={l} type="button" className={`pill-btn${plan === i ? " on" : ""}`} onClick={() => setPlan(i)}>{l}</button>
        ))}
      </div>
      <div className="cotizar-grid">
        <label htmlFor="cb-nombre">Cliente<input id="cb-nombre" name="cliente_nombre" required /></label>
        <label htmlFor="cb-email">Correo (opcional: Bold le envía el link)<input id="cb-email" name="cliente_email" type="email" /></label>
        <label htmlFor="cb-tel">WhatsApp<input id="cb-tel" name="cliente_telefono" type="tel" placeholder="+57 300 000 0000" /></label>
        <label htmlFor="cb-concepto">Concepto<input id="cb-concepto" name="concepto" required defaultValue={p.concepto} maxLength={100} /></label>
        <label htmlFor="cb-monto">Monto<input id="cb-monto" name="monto" required inputMode="decimal" defaultValue={p.monto} /></label>
        <label htmlFor="cb-moneda">Moneda
          <select id="cb-moneda" name="moneda" defaultValue={p.moneda}><option>USD</option><option>COP</option></select>
        </label>
      </div>
      {estado?.error && <div className="alert error">{estado.error}</div>}
      {estado?.ok && <div className="alert ok">{estado.ok}</div>}
      <button type="submit" disabled={pending}>{pending ? "Creando link…" : "Crear link de pago Bold"}</button>
    </form>
  );
}
