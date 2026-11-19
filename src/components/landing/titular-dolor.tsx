"use client";

import { useEffect, useState } from "react";

// Titular que "teclea" los dolores del cliente uno tras otro y luego borra (patrón de la página corta).
const DOLORES = [
  "¿Publicas todos los días y nadie te compra?",
  "¿Tu marca se ve bonita pero no vende?",
  "¿Te llegan leads y nadie les da seguimiento?",
  "¿Pagas anuncios y no sabes cuál te trae clientes?",
];

export function TitularDolor() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(DOLORES[0].length); // primer pintado completo (SEO y sin parpadeo)
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const texto = DOLORES[i];
    let t: ReturnType<typeof setTimeout>;
    if (!borrando && n === texto.length) t = setTimeout(() => setBorrando(true), 2200);
    else if (borrando && n === 0) t = setTimeout(() => { setBorrando(false); setI((i + 1) % DOLORES.length); }, 250);
    else t = setTimeout(() => setN(n + (borrando ? -1 : 1)), borrando ? 18 : 38);
    return () => clearTimeout(t);
  }, [i, n, borrando]);

  return (
    <p className="dolor" aria-live="off">
      <span className="sr-only">{DOLORES.join(" ")}</span>
      <span aria-hidden="true">{DOLORES[i].slice(0, n)}<span className="cursor" /></span>
    </p>
  );
}
