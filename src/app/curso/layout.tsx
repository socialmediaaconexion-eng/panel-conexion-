import type { Metadata } from "next";

// Área del alumno: manifiesto propio para que "Instalar en mi celular" abra el curso (y no el panel del equipo).
export const metadata: Metadata = {
  title: "Mis cursos — Conexión",
  manifest: "/curso/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Conexión Cursos", statusBarStyle: "black" },
  robots: { index: false },
};

export default function CursoLayout({ children }: { children: React.ReactNode }) {
  return <div className="alu">{children}</div>;
}
