"use client";

import { useTransition } from "react";
import type { FuenteVideo } from "@/lib/video";

// Reproductor de la lección: YouTube (no listado) y Vimeo en iframe; mp4 directo con <video>.
// Con mp4, al terminar el video la lección se marca como vista sola.
export function Reproductor({ fuente, titulo, alTerminar }: { fuente: FuenteVideo; titulo: string; alTerminar?: () => Promise<void> }) {
  const [, start] = useTransition();
  if (fuente.tipo === "ninguno") {
    return <div className="alu-video alu-video-vacio"><span>El video de esta lección llega muy pronto.</span></div>;
  }
  if (fuente.tipo === "archivo") {
    return (
      <div className="alu-video">
        <video src={fuente.src} controls playsInline preload="metadata" controlsList="nodownload" onEnded={() => alTerminar && start(() => alTerminar())} />
      </div>
    );
  }
  return (
    <div className="alu-video">
      <iframe
        src={fuente.embed}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
