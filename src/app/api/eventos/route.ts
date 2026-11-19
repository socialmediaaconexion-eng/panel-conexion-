import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Recibe los pasos del embudo que manda el navegador (sendBeacon). Lista cerrada de eventos.
const EVENTOS = new Set(["vsl_vista", "video_play", "video_25", "video_50", "video_75", "video_100", "cta_aplicar", "aplicar_vista", "agenda_vista", "gracias_vista"]);
const corto = (v: unknown, n = 200) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = JSON.parse(await req.text()); } catch { return new NextResponse(null, { status: 400 }); }
  const evento = corto(body.evento, 40);
  const sesion = corto(body.sesion, 64);
  if (!evento || !EVENTOS.has(evento) || !sesion) return new NextResponse(null, { status: 400 });

  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|preview|headless/i.test(ua)) return new NextResponse(null, { status: 204 });

  await createAdminClient().from("embudo_eventos").insert({
    evento, sesion,
    utm_source: corto(body.utm_source), utm_medium: corto(body.utm_medium),
    utm_campaign: corto(body.utm_campaign), utm_content: corto(body.utm_content),
    referrer: corto(body.referrer, 300),
    dispositivo: /Mobi|Android|iPhone/i.test(ua) ? "movil" : "escritorio",
  });
  return new NextResponse(null, { status: 204 });
}
