import { NextResponse } from "next/server";

// Manifiesto de la app del alumno: se instala con el ícono de ALMA y abre directo en /curso.
export function GET() {
  return NextResponse.json(
    {
      id: "/curso",
      name: "ALMA — Mis cursos",
      short_name: "ALMA",
      description: "ALMA by Conexión: tu workshop en el celular",
      start_url: "/curso",
      scope: "/curso",
      display: "standalone",
      background_color: "#FFFDF8",
      theme_color: "#B8924A",
      icons: [
        { src: "/alma-icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/alma-icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/alma-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" } },
  );
}
