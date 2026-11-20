import { Rastreo } from "@/components/rastreo";

// Embudo del workshop: el Rastreo escucha los clics con data-evento (workshop_cta) y guarda los UTMs de la visita.
export default function WorkshopLayout({ children }: { children: React.ReactNode }) {
  return <><Rastreo />{children}</>;
}
