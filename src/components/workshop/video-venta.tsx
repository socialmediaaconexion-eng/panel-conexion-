"use client";

import { useRef, useState } from "react";
import { rastrear } from "@/components/rastreo";

// Video de venta del workshop (16:9) con portada de marca. Mientras `listo` sea false (no se ha subido
// public/workshop-vsl.mp4), la portada no intenta reproducir: lleva a la sección "Qué aprenderás".
export function VideoVenta({ src, poster, listo, titulo }: { src: string; poster: string; listo: boolean; titulo: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [iniciado, setIniciado] = useState(false);
  const [hecho, setHecho] = useState(false);

  function play() {
    if (!listo) { document.getElementById("aprenderas")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    setIniciado(true);
    requestAnimationFrame(() => video.current?.play().catch(() => {}));
  }

  return (
    <div className={`vsl${iniciado ? " vsl-on" : ""}`}>
      {listo && (
        <video
          ref={video} controls={iniciado} preload="metadata" playsInline poster={poster}
          onPlay={() => { setIniciado(true); if (!hecho) { setHecho(true); rastrear("workshop_video_play"); } }}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
      {!iniciado && (
        <button
          type="button"
          className="vsl-portada con-foto"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(13,13,15,.15), rgba(13,13,15,.75)), url(${poster}), radial-gradient(90% 120% at 50% 40%, #1d1d22 0%, #0d0d0f 60%, #050506 100%)` }}
          onClick={play}
          aria-label={`Reproducir el video: ${titulo}`}
        >
          <span className="vsl-grano" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-alma.png" alt="" className="vsl-logo" />
          <span className="vsl-play" aria-hidden="true"><span /></span>
          <span className="vsl-texto">
            <strong>{titulo}</strong>
            <span>{listo ? "Video · activa el sonido" : "El video llega muy pronto · mira qué vas a aprender"}</span>
          </span>
        </button>
      )}
    </div>
  );
}
