import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conexión — Panel",
  description: "Panel de gestión comercial de Conexión Agency",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
