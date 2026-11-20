import Link from "next/link";
import { WORKSHOP } from "@/lib/workshop";

// Tarjeta final del curso: escalera de valor hacia el servicio de Conexión (/aplicar).
export function SiguientePaso() {
  const s = WORKSHOP.siguientePaso;
  return (
    <aside className="alu-siguiente">
      <span className="alu-tag">Siguiente paso</span>
      <h2>{s.titulo}</h2>
      <p>{s.texto}</p>
      <Link href={s.href} className="btn">{s.cta}</Link>
    </aside>
  );
}
