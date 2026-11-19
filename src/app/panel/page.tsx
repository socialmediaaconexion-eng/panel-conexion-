import Link from "next/link";
import { requireSeller, esGestor } from "@/lib/auth";
import { dinero, fechaHora } from "@/lib/format";

export default async function Resumen() {
  const { seller, supabase } = await requireSeller();
  const gestor = esGestor(seller);

  const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(inicioDia); finDia.setDate(finDia.getDate() + 1);
  const inicioMes = new Date(inicioDia.getFullYear(), inicioDia.getMonth(), 1);
  const ahora = new Date().toISOString();

  const [leadsHoy, citasHoy, ventasMes, vencidas, huerfanos, multiples, handoffs] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", inicioDia.toISOString()),
    supabase.from("citas").select("id, start_at, estado, leads(nombre)").gte("start_at", inicioDia.toISOString()).lt("start_at", finDia.toISOString()).in("estado", ["agendada", "reagendada"]).order("start_at"),
    supabase.from("ventas").select("monto_abonado, moneda").gte("created_at", inicioMes.toISOString()),
    supabase.from("citas").select("id, start_at, leads(nombre), sellers(nombre)").lt("end_at", ahora).in("estado", ["agendada", "reagendada"]).order("start_at"),
    gestor ? supabase.from("v_leads_huerfanos").select("id, nombre, email, created_at").order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    gestor ? supabase.from("v_leads_multiples_duenos_hoy").select("*") : Promise.resolve({ data: [] }),
    gestor ? supabase.from("sale_handoffs").select("id", { count: "exact", head: true }).eq("estado", "pendiente") : Promise.resolve({ count: 0 }),
  ]);

  const cobradoUSD = (ventasMes.data ?? []).filter((v) => v.moneda === "USD").reduce((s, v) => s + Number(v.monto_abonado), 0);
  const nombre = (rel: unknown) => (Array.isArray(rel) ? rel[0]?.nombre : (rel as { nombre?: string } | null)?.nombre) ?? "—";

  return (
    <>
      <h1>Resumen</h1>
      <p className="muted">{gestor ? "Vista de todo el equipo." : "Tus leads, citas y ventas."}</p>

      <div className="grid" style={{ marginTop: 16 }}>
        <div className="card stat"><div className="n">{leadsHoy.count ?? 0}</div><div className="l">Leads nuevos hoy</div></div>
        <div className="card stat"><div className="n">{citasHoy.data?.length ?? 0}</div><div className="l">Citas activas hoy</div></div>
        <div className="card stat"><div className="n">{dinero(cobradoUSD)}</div><div className="l">Cobrado este mes (USD)</div></div>
        {gestor && <div className="card stat"><div className="n">{handoffs.count ?? 0}</div><div className="l">Ventas pendientes de pasar a entrega</div></div>}
      </div>

      <h2>Alertas</h2>
      {(vencidas.data?.length ?? 0) === 0 && (huerfanos.data?.length ?? 0) === 0 && (multiples.data?.length ?? 0) === 0 && (
        <div className="alert ok">Todo en orden: sin citas vencidas, leads sin dueño ni choques de asignación.</div>
      )}
      {(vencidas.data?.length ?? 0) > 0 && (
        <div className="card" style={{ marginBottom: 10 }}>
          <span className="pill warn">{vencidas.data!.length}</span> citas ya pasaron y siguen sin cerrar (marca si asistió o no).
          <ul>{vencidas.data!.slice(0, 8).map((c) => <li key={c.id}>{nombre(c.leads)} · {fechaHora(c.start_at)} · {nombre(c.sellers)}</li>)}</ul>
          <Link href="/panel/citas">Ir a Citas →</Link>
        </div>
      )}
      {(huerfanos.data?.length ?? 0) > 0 && (
        <div className="card" style={{ marginBottom: 10 }}>
          <span className="pill red">{huerfanos.data!.length}</span> leads sin dueño (no había vendedores activos cuando entraron).
          <ul>{huerfanos.data!.slice(0, 8).map((l) => <li key={l.id}><Link href={`/panel/leads/${l.id}`}>{l.nombre}</Link> · {l.email}</li>)}</ul>
        </div>
      )}
      {(multiples.data?.length ?? 0) > 0 && (
        <div className="card" style={{ marginBottom: 10 }}>
          <span className="pill red">{multiples.data!.length}</span> leads pasaron por 2+ vendedores hoy — revisa que no los estén llamando varias personas.
          <ul>{multiples.data!.map((l) => <li key={l.lead_id}><Link href={`/panel/leads/${l.lead_id}`}>{l.nombre}</Link> · {l.vendedores} vendedores</li>)}</ul>
        </div>
      )}

      <h2>Citas de hoy</h2>
      {(citasHoy.data?.length ?? 0) === 0 ? <p className="muted">No hay citas activas hoy.</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Hora</th><th>Lead</th><th>Estado</th></tr></thead>
          <tbody>{citasHoy.data!.map((c) => <tr key={c.id}><td>{fechaHora(c.start_at)}</td><td>{nombre(c.leads)}</td><td>{c.estado}</td></tr>)}</tbody>
        </table></div>
      )}
    </>
  );
}
