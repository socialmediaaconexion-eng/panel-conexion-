"use client";

import { useActionState, useState } from "react";
import { comprarWorkshop } from "./actions";
import { CamposRastreo } from "@/components/rastreo";

// El país decide el precio: Colombia paga en COP (PSE, Nequi o tarjeta, IVA incluido); los demás en USD con tarjeta, sin IVA.
export function ComprarForm({ cop, usd, paises, inicial, notaCop }: { cop: string | null; usd: string | null; paises: string[]; inicial: string; notaCop: string }) {
  const [error, action, pending] = useActionState(comprarWorkshop, null);
  const [pais, setPais] = useState(inicial);
  const enCop = pais === "Colombia" && Boolean(cop);
  const precio = enCop ? cop : usd;

  return (
    <form action={action} className="embudo-form ws-compra" data-rastreo>
      <CamposRastreo />
      <input type="text" name="empresa_web" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <label htmlFor="w-nombre">Nombre completo<input id="w-nombre" name="nombre" required autoComplete="name" /></label>
      <label htmlFor="w-email">Correo (ahí te llega el acceso)<input id="w-email" name="email" type="email" required autoComplete="email" inputMode="email" /></label>
      <label htmlFor="w-wa">WhatsApp<input id="w-wa" name="whatsapp" type="tel" required placeholder="+57 300 000 0000" autoComplete="tel" /></label>
      <label htmlFor="w-pais">País
        <select id="w-pais" name="pais" required value={pais} onChange={(e) => setPais(e.target.value)}>
          <option value="" disabled>Elige tu país</option>
          {paises.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>

      {pais && precio && (
        <div className="ws-resumen" aria-live="polite">
          <div><span className="muted small">Total · pago único</span><strong>{precio}</strong></div>
          <span className="pill">{enCop ? `${notaCop} · PSE, Nequi o tarjeta` : "Tarjeta de crédito o débito · sin IVA"}</span>
        </div>
      )}

      {error && <div className="alert error" role="alert">{error}</div>}
      <button type="submit" className="btn-big" disabled={pending || !pais}>{pending ? "Abriendo el pago…" : "Ir a pagar"}</button>
      <p className="muted small" style={{ margin: 0, textAlign: "center" }}>El pago se hace en Bold, de forma segura. Al confirmarse, te llega el acceso a tu correo.</p>
    </form>
  );
}
