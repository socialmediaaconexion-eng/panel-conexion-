"use client";

import { useRef } from "react";
import { rastrear } from "./rastreo";

// Video del VSL que reporta play y cuánto se vio (25/50/75/100 %), una vez cada uno por carga.
export function VslVideo() {
  const hechos = useRef(new Set<string>());
  const una = (e: string) => { if (!hechos.current.has(e)) { hechos.current.add(e); rastrear(e); } };
  return (
    <video
      controls preload="metadata" poster="/vsl-poster.jpg" playsInline
      onPlay={() => una("video_play")}
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
      <source src="/vsl.mp4" type="video/mp4" />
    </video>
  );
}
