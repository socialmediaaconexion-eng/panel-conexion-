"use client";

import { useEffect } from "react";
import { rastrear } from "@/components/rastreo";

// Dispara un evento de vista una sola vez por sesión del navegador (como el Rastreo del embudo VSL).
export function VistaUnaVez({ evento }: { evento: string }) {
  useEffect(() => {
    const k = `cx-visto-${evento}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    rastrear(evento);
  }, [evento]);
  return null;
}
