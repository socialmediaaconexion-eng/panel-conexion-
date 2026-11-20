import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Intro } from "@/components/intro";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "Conexión — Panel",
  description: "Panel de gestión comercial de Conexión Agency",
  appleWebApp: { capable: true, title: "Conexión", statusBarStyle: "black" },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "light dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable} suppressHydrationWarning>
      <body><Intro />{children}</body>
    </html>
  );
}
