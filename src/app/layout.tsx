import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Intro } from "@/components/intro";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  metadataBase: new URL("https://conexionteam.app"),
  title: "Conexión — Panel",
  description: "Panel de gestión comercial de Conexión Agency",
  manifest: "/manifest.webmanifest", // el área del alumno lo reemplaza por /curso/manifest.webmanifest
  appleWebApp: { capable: true, title: "Conexión", statusBarStyle: "black" },
  formatDetection: { telephone: false, email: false, address: false, date: false },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "light dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable} suppressHydrationWarning>
      <body><Intro />{children}</body>
    </html>
  );
}
