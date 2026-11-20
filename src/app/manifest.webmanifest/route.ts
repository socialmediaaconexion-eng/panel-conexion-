import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";

// Permite "Agregar a pantalla de inicio" con el ícono 3D de Conexión; abre directo en el panel.
// Es un route handler (y no app/manifest.ts) para que el área del alumno pueda declarar su propio
// manifiesto (/curso/manifest.webmanifest): el manifest.ts de la raíz se imponía en todas las rutas.
const MANIFIESTO: MetadataRoute.Manifest = {
  name: "Conexión — Panel",
  short_name: "Conexión",
  description: "Panel de gestión comercial de Conexión",
  start_url: "/panel",
  scope: "/",
  display: "standalone",
  background_color: "#000000",
  theme_color: "#000000",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(MANIFIESTO, { headers: { "Content-Type": "application/manifest+json" } });
}
