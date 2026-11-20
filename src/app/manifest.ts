import type { MetadataRoute } from "next";

// Permite "Agregar a pantalla de inicio" con el ícono 3D de Conexión; abre directo en el panel.
export default function manifest(): MetadataRoute.Manifest {
  return {
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
}
