import Link from "next/link";
import { requireSeller, esGestor } from "@/lib/auth";
import { dinero, fecha } from "@/lib/format";
import { procesarHandoff, registrarAbono } from "./actions";

type Rel = { id?: string; nombre: string } | { id?: string; nombre: string }[] | null;
const uno = (r: Rel) => (Array.isArray(r) ? r[0] : r);

export default async function VentasPage() {
  const { seller, supabase } = await requireSeller();
  const gestor = esGestor(seller);

  const [{ data: ventas }, handoffs] = await Promise.all([
    supabase.from("ventas").select("id, producto, moneda, monto_total, monto_abonado, estado, created_at, leads(id, nombre), sellers(nombre)").order("created_at", { ascending: false }).limit(300),
    gestor ? supabase.from("sale_handoffs").select("id, created_at, ventas(producto, leads(nombre), sellers(nombre))").eq("estado", "pendiente").order("created_at") : Promise.resolve({ data: [] }),
  ]);

  const totales = new Map<string, { vendido: number; cobrado: number }>();
  for (const v of ventas ?? []) {
    const t = totales.get(v.moneda) ?? { vendido: 0, cobrado: 0 };
    t.vendido += Number(v.monto_total); t.cobrado += Number(v.monto_abonado);
    totales.set(v.moneda, t);
  }

  return (
    <>
      <h1>Ventas</h1>
      <p className="muted">Las ventas se registran desde la ficha de cada lead. Cada moneda se suma por separado, sin conversión.</p>

      <div className="grid" style={{ marginTop: 16 }}>
        {[...totales.entries()].map(([m, t]) => (
          <div key={m} className="card stat">
            <div className="n">{dinero(t.cobrado, m)}</div>
            <div className="l">Cobrado {m} · de {dinero(t.vendido, m)} vendido · saldo {dinero(t.vendido - t.cobrado, m)}</div>
          </div>
        ))}
        {totales.size === 0 && <div className="card muted">Todavía no hay ventas.</div>}
      </div>

      {gestor && (handoffs.data ?? []).length > 0 && (
        <>
          <h2>Pendientes de pasar a entrega</h2>
          <div className="table-wrap"><table>
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Vendedor</th><th></th></tr></thead>
            <tbody>{handoffs.data!.map((h) => {
              const v = (Array.isArray(h.ventas) ? h.ventas[0] : h.ventas) as { producto: string; leads: Rel; sellers: Rel } | null;
              return (
                <tr key={h.id}>
                  <td>{fecha(h.created_at)}</td><td>{uno(v?.leads ?? null)?.nombre ?? "—"}</td><td>{v?.producto}</td><td>{uno(v?.sellers ?? null)?.nombre ?? "—"}</td>
                  <td><form action={procesarHandoff.bind(null, h.id)}><button type="submit" className="ghost">Marcar entregada</button></form></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        </>
      )}

      <h2>Todas las ventas</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Vendedor</th><th>Total</th><th>Abonado</th><th>Estado</th>{gestor && <th>Abono</th>}</tr></thead>
        <tbody>
          {(ventas ?? []).length === 0 && <tr><td colSpan={gestor ? 8 : 7} className="muted">Sin ventas.</td></tr>}
          {(ventas ?? []).map((v) => {
            const lead = uno(v.leads as Rel);
            return (
              <tr key={v.id}>
                <td>{fecha(v.created_at)}</td>
                <td>{lead?.id ? <Link href={`/panel/leads/${lead.id}`}>{lead.nombre}</Link> : "—"}</td>
                <td>{v.producto}</td>
                <td>{uno(v.sellers as Rel)?.nombre ?? "—"}</td>
                <td className="num">{dinero(Number(v.monto_total), v.moneda)}</td>
                <td className="num">{dinero(Number(v.monto_abonado), v.moneda)}</td>
                <td><span className={`pill ${v.estado === "pagada" ? "good" : "warn"}`}>{v.estado === "pagada" ? "Pagada" : "Con saldo"}</span></td>
                {gestor && <td>{v.estado !== "pagada" && (
                  <form action={registrarAbono.bind(null, v.id)} className="inline">
                    <input name="abono" type="number" min={0.01} step={0.01} aria-label="Monto del abono" style={{ width: 90 }} required />
                    <button type="submit" className="ghost">Abonar</button>
                  </form>
                )}</td>}
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </>
  );
}
