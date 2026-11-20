"use client";

import { useEffect, useState } from "react";

type PromptInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// Botón "Instalar en mi celular". Solo aparece si el navegador lo permite (Chrome/Edge/Android: beforeinstallprompt).
// En iPhone (Safari no tiene ese evento) muestra cómo agregarlo a la pantalla de inicio. Instalada, no se muestra.
export function Instalar() {
  const [prompt, setPrompt] = useState<PromptInstalar | null>(null);
  const [ios, setIos] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const [instalada, setInstalada] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent));
    const antes = (e: Event) => { e.preventDefault(); setPrompt(e as PromptInstalar); };
    const listo = () => { setInstalada(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", antes);
    window.addEventListener("appinstalled", listo);
    return () => { window.removeEventListener("beforeinstallprompt", antes); window.removeEventListener("appinstalled", listo); };
  }, []);

  if (instalada || (!prompt && !ios)) return null;

  if (prompt) {
    return (
      <button type="button" className="ghost alu-instalar" onClick={async () => { await prompt.prompt(); await prompt.userChoice.catch(() => null); setPrompt(null); }}>
        <span aria-hidden="true">＋</span> Instalar en mi celular
      </button>
    );
  }
  return (
    <div className="alu-instalar-ios">
      <button type="button" className="ghost alu-instalar" onClick={() => setAyuda(!ayuda)} aria-expanded={ayuda}>
        <span aria-hidden="true">＋</span> Instalar en mi celular
      </button>
      {ayuda && <p className="muted small">En Safari toca el botón <strong>Compartir</strong> (el cuadro con la flecha) y luego <strong>Agregar a inicio</strong>.</p>}
    </div>
  );
}
