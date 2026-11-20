"use client";

import { useState } from "react";

export function CopiarLink({ url }: { url: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" className="ghost small" onClick={async () => {
      try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1800); } catch { window.prompt("Copia el link:", url); }
    }}>{ok ? "Copiado ✓" : "Copiar link"}</button>
  );
}
