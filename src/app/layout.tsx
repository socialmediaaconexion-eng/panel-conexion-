import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-display" });
const texto = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "Conexión — Panel",
  description: "Panel de gestión comercial de Conexión Agency",
};

export const viewport: Viewport = { themeColor: "#1A1414", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
