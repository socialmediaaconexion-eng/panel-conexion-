import { NextResponse } from "next/server";

// Manifiesto de la app del alumno: se instala con el ícono de Conexión y abre directo en /curso.
export function GET() {
  return NextResponse.json(
    {
      id: "/curso",
      name: "Conexión — Mis cursos",
      short_name: "Conexión",
      description: "Tus cursos de Conexión en el celular",
      start_url: "/curso",
      scope: "/curso",
      display: "standalone",
      background_color: "#FFFFFF",
      theme_color: "#0D0D0F",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } },
  );
}
