"use client";

import { useState } from "react";

// Prompt o plantilla de la lección con botón para copiar (pensado para pegar en Claude desde el celular).
export function CopiarPrompt({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <section className="alu-card alu-prompt">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <strong>Prompt para copiar</strong>
        <button type="button" className="ghost small" onClick={async () => {
          try { await navigator.clipboard.writeText(texto); setOk(true); setTimeout(() => setOk(false), 1800); } catch { window.prompt("Copia el prompt:", texto); }
        }}>{ok ? "Copiado ✓" : "Copiar"}</button>
      </div>
      <pre>{texto}</pre>
    </section>
  );
}
