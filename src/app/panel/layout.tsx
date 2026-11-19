import { requireSeller, esGestor } from "@/lib/auth";
import { logout } from "../login/actions";
import { Nav } from "./nav";
import { TemaToggle } from "@/components/tema-toggle";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { seller } = await requireSeller();
  return (
    <div className="shell">
      <aside className="sidebar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" />
        <Nav esGestor={esGestor(seller)} />
        <div className="who">
          <div><strong>{seller.nombre}</strong></div>
          <div className="muted">{seller.rol} · {seller.tipo}</div>
          <div className="row" style={{ marginTop: 10, gap: 8 }}>
            <TemaToggle />
            <form action={logout}><button type="submit" className="ghost small">Cerrar sesión</button></form>
          </div>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
