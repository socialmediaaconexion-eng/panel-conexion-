"use client";

import { useRef, useState } from "react";
import { rastrear } from "./rastreo";

// VSL en formato horizontal (16:9) con portada de marca. Al tocar la portada empieza el video.
// Cuando llegue el VSL horizontal: subir public/vsl-horizontal.mp4 (1920×1080, H.264) y pasar src="/vsl-horizontal.mp4".
// Sin src, la portada lleva al video corto de la sección Testimonios.

export function VslVideo({ src, poster }: { src?: string; poster?: string }) {
  const hechos = useRef(new Set<string>());
  const video = useRef<HTMLVideoElement>(null);
  const [iniciado, setIniciado] = useState(false);
  const una = (e: string) => { if (!hechos.current.has(e)) { hechos.current.add(e); rastrear(e); } };

  function play() {
    if (!src) { document.getElementById("testimonios")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    setIniciado(true);
    requestAnimationFrame(() => video.current?.play().catch(() => {}));
  }

  return (
    <div className={`vsl${iniciado ? " vsl-on" : ""}`}>
      <video
        ref={video} controls={iniciado} preload="metadata" playsInline poster={poster}
        onPlay={() => { setIniciado(true); una("video_play"); }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (!v.duration) return;
          const p = v.currentTime / v.duration;
          if (p >= 0.25) una("video_25");
          if (p >= 0.5) una("video_50");
          if (p >= 0.75) una("video_75");
        }}
        onEnded={() => una("video_100")}
      >
        {src && <source src={src} type="video/mp4" />}
      </video>
      {!iniciado && (
        <button type="button" className={`vsl-portada${poster ? " con-foto" : ""}`} style={poster ? { backgroundImage: `linear-gradient(180deg, rgba(13,13,15,.15), rgba(13,13,15,.75)), url(${poster})` } : undefined} onClick={play} aria-label="Reproducir el video: cómo funciona tu sistema de captación">
          <span className="vsl-grano" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-3d.png" alt="" className="vsl-logo" />
          <span className="vsl-play" aria-hidden="true"><span /></span>
          <span className="vsl-texto">
            <strong>Cómo funciona tu sistema de captación</strong>
            <span>{src ? "Video · activa el sonido" : "El video completo llega muy pronto · mira el video corto"}</span>
          </span>
        </button>
      )}
    </div>
  );
}
