"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Mientras Bold confirma el pago, vuelve a consultar cada 8 s (hasta ~4 minutos).
export function Refrescar() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => { if (++n > 30) clearInterval(id); else router.refresh(); }, 8000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
