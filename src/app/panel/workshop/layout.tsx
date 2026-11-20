import { requireGestor } from "@/lib/auth";
import { SubNav } from "./ui";

// Sección Workshop (ALMA) del panel: solo gestores (admin, manager o asignador).
export default async function WorkshopPanelLayout({ children }: { children: React.ReactNode }) {
  await requireGestor();
  return (
    <>
      <h1>Workshop · ALMA</h1>
      <SubNav />
      {children}
    </>
  );
}
