"use client";

import { useRef, useState } from "react";
import { rastrear } from "./rastreo";

// VSL en formato horizontal (16:9) con portada de marca. Al tocar la portada empieza el video.
// Para cambiar el video: reemplazar public/vsl.mp4 (ideal 1920×1080, H.264) — no hay que tocar código.
const VIDEO = "/vsl.mp4";

export function VslVideo() {
  const hechos = useRef(new Set<string>());
  const video = useRef<HTMLVideoElement>(null);
  const [iniciado, setIniciado] = useState(false);
  const una = (e: string) => { if (!hechos.current.has(e)) { hechos.current.add(e); rastrear(e); } };

  function play() {
    setIniciado(true);
    requestAnimationFrame(() => video.current?.play().catch(() => {}));
  }

  return (
    <div className={`vsl${iniciado ? " vsl-on" : ""}`}>
      <video
        ref={video} controls={iniciado} preload="metadata" playsInline
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
        <source src={VIDEO} type="video/mp4" />
      </video>
      {!iniciado && (
        <button type="button" className="vsl-portada" onClick={play} aria-label="Reproducir el video: cómo funciona tu sistema de captación">
          <span className="vsl-grano" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="vsl-logo" />
          <span className="vsl-play" aria-hidden="true"><span /></span>
          <span className="vsl-texto">
            <strong>Cómo funciona tu sistema de captación</strong>
            <span>Video · 1 minuto · activa el sonido</span>
          </span>
        </button>
      )}
    </div>
  );
}
