import type { Metadata, Viewport } from "next";
import { Outfit, Manrope } from "next/font/google";
import "./globals.css";
import { Intro } from "@/components/intro";

const display = Outfit({ subsets: ["latin"], weight: ["300", "500", "600"], variable: "--font-display" });
const texto = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "Conexión — Panel",
  description: "Panel de gestión comercial de Conexión Agency",
};

export const viewport: Viewport = { themeColor: "#0D0D0F", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body><Intro />{children}</body>
    </html>
  );
}
