"use client";

import { useEffect, useState } from "react";

// Cambia entre modo claro (por defecto) y oscuro; se recuerda en este navegador.
export function TemaToggle() {
  const [oscuro, setOscuro] = useState(false);
  useEffect(() => { setOscuro(document.documentElement.getAttribute("data-theme") === "dark"); }, []);

  function cambiar() {
    const nuevo = !oscuro;
    setOscuro(nuevo);
    if (nuevo) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem("cx-tema", nuevo ? "dark" : "light"); } catch {}
  }

  return (
    <button type="button" className="tema" onClick={cambiar} aria-pressed={oscuro}>
      <span className="tema-ico" aria-hidden="true" />
      {oscuro ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
