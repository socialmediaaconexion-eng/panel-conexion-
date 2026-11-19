"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Rastreo propio del embudo (sin cookies de terceros): sesión anónima por pestaña + UTMs de la primera visita.
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;
const VISTA: Record<string, string> = { "/vsl": "vsl_vista", "/": "vsl_vista", "/aplicar": "aplicar_vista", "/agenda": "agenda_vista", "/gracias": "gracias_vista" };

function guardado(k: string) { try { return sessionStorage.getItem(k); } catch { return null; } }
function guardar(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch {} }

export function sesionEmbudo() {
  let s = guardado("cx-sesion");
  if (!s) { s = crypto.randomUUID(); guardar("cx-sesion", s); }
  return s;
}

function utms() {
  const q = new URLSearchParams(location.search);
  const out: Record<string, string> = {};
  for (const k of UTM) {
    const v = q.get(k) || guardado(`cx-${k}`);
    if (v) { out[k] = v; guardar(`cx-${k}`, v); }
  }
  return out;
}

export function rastrear(evento: string) {
  if (typeof window === "undefined") return;
  const data = JSON.stringify({ evento, sesion: sesionEmbudo(), referrer: document.referrer || null, ...utms() });
  const ok = navigator.sendBeacon?.("/api/eventos", new Blob([data], { type: "application/json" }));
  if (!ok) fetch("/api/eventos", { method: "POST", body: data, keepalive: true }).catch(() => {});
}

// Una vista por paso y por sesión; además escucha clics en elementos con data-evento.
export function Rastreo() {
  const ruta = usePathname();
  useEffect(() => {
    const ev = VISTA[ruta];
    if (ev && !guardado(`cx-visto-${ev}`)) { guardar(`cx-visto-${ev}`, "1"); rastrear(ev); }
  }, [ruta]);
  useEffect(() => {
    const clic = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-evento]");
      if (el) rastrear(el.getAttribute("data-evento")!);
    };
    document.addEventListener("click", clic);
    return () => document.removeEventListener("click", clic);
  }, []);
  return null;
}

// Campos ocultos para que la aplicación lleve la sesión y los UTMs al lead.
export function CamposRastreo() {
  useEffect(() => {
    const f = document.querySelector<HTMLFormElement>("form[data-rastreo]");
    if (!f) return;
    const set = (n: string, v: string) => { const i = f.querySelector<HTMLInputElement>(`input[name="${n}"]`); if (i && !i.value) i.value = v; };
    set("sesion", sesionEmbudo());
    for (const [k, v] of Object.entries(utms())) set(k, v);
  }, []);
  return (
    <>
      <input type="hidden" name="sesion" />
      {UTM.map((k) => <input key={k} type="hidden" name={k} />)}
    </>
  );
}
