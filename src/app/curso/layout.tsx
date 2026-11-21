import type { Metadata } from "next";
import { playfair } from "@/lib/fuentes-alma";

// Área del alumno: manifiesto propio para que "Instalar en mi celular" abra el curso (y no el panel del equipo).
export const metadata: Metadata = {
  title: "ALMA — Mis cursos",
  manifest: "/curso/manifest.webmanifest",
  appleWebApp: { capable: true, title: "ALMA", statusBarStyle: "default" },
  robots: { index: false },
};

export default function CursoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`alu alma ${playfair.variable}`}>{children}</div>;
}
