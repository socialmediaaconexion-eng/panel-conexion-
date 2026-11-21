import { Rastreo } from "@/components/rastreo";
import { playfair } from "@/lib/fuentes-alma";

// Embudo del workshop: el Rastreo escucha los clics con data-evento (workshop_cta) y guarda los UTMs de la visita.
// Marca propia de ALMA: blanco y dorado (clase .alma en globals.css).
export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return <div className={`alma ${playfair.variable}`}><Rastreo />{children}</div>;
}
