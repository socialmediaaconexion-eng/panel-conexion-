import { requireSeller, esGestor } from "@/lib/auth";
import { logout } from "../login/actions";
import { Nav } from "./nav";

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
          <form action={logout}><button type="submit" className="ghost small" style={{ marginTop: 8 }}>Cerrar sesión</button></form>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
