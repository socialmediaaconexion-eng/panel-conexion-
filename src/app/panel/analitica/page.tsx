import { requireGestor } from "@/lib/auth";
import { dinero } from "@/lib/format";

type Props = { searchParams: Promise<{ dias?: string }> };

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");

export default async function AnaliticaPage({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  const { dias = "30" } = await searchParams;
  const n = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const desde = new Date(Date.now() - n * 86400_000).toISOString();

  const [{ data: leads }, { data: citas }, { data: ventas }, { data: equipo }] = await Promise.all([
    supabase.from("leads").select("id, embudo, etapa, utm_source").gte("created_at", desde),
    supabase.from("citas").select("lead_id, seller_id, estado, start_at").gte("start_at", desde),
    supabase.from("ventas").select("lead_id, seller_id, moneda, monto_total, monto_abonado").gte("created_at", desde),
    supabase.from("sellers").select("id, nombre, tipo").eq("activo", true).order("nombre"),
  ]);

  const L = leads ?? [], C = citas ?? [], V = ventas ?? [];
  const leadsConCita = new Set(C.map((c) => c.lead_id)).size;
  const cerradas = C.filter((c) => c.estado === "atendida" || c.estado === "no_asistio");
  const atendidas = C.filter((c) => c.estado === "atendida").length;
  const leadsConVenta = new Set(V.map((v) => v.lead_id)).size;

  const porEmbudo = new Map<string, { leads: number; agendados: number; clientes: number }>();
  for (const l of L) {
    const e = porEmbudo.get(l.embudo) ?? { leads: 0, agendados: 0, clientes: 0 };
    e.leads++;
    if (C.some((c) => c.lead_id === l.id)) e.agendados++;
    if (V.some((v) => v.lead_id === l.id)) e.clientes++;
    porEmbudo.set(l.embudo, e);
  }

  const porFuente = new Map<string, number>();
  for (const l of L) porFuente.set(l.utm_source || "(directo / sin UTM)", (porFuente.get(l.utm_source || "(directo / sin UTM)") ?? 0) + 1);

  return (
    <>
      <h1>Analítica</h1>
      <div className="row" style={{ margin: "10px 0 16px" }}>
        {[7, 30, 90].map((d) => <a key={d} href={`/panel/analitica?dias=${d}`} className={`pill ${n === d ? "red" : ""}`}>Últimos {d} días</a>)}
      </div>

      <div className="grid">
        <div className="card stat"><div className="n">{L.length}</div><div className="l">Leads</div></div>
        <div className="card stat"><div className="n">{pct(leadsConCita, L.length)}</div><div className="l">Leads que agendaron ({leadsConCita})</div></div>
        <div className="card stat"><div className="n">{pct(atendidas, cerradas.length)}</div><div className="l">Asistencia a citas ({atendidas} de {cerradas.length} ya cerradas)</div></div>
        <div className="card stat"><div className="n">{pct(leadsConVenta, leadsConCita)}</div><div className="l">Cierre: agendados que compraron ({leadsConVenta})</div></div>
      </div>

      <h2>Por embudo</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Embudo</th><th>Leads</th><th>Agendaron</th><th>Compraron</th><th>Lead → venta</th></tr></thead>
        <tbody>
          {porEmbudo.size === 0 && <tr><td colSpan={5} className="muted">Sin datos en este periodo.</td></tr>}
          {[...porEmbudo.entries()].sort((a, b) => b[1].leads - a[1].leads).map(([e, s]) => (
            <tr key={e}><td>{e}</td><td className="num">{s.leads}</td><td className="num">{s.agendados}</td><td className="num">{s.clientes}</td><td className="num">{pct(s.clientes, s.leads)}</td></tr>
          ))}
        </tbody>
      </table></div>

      <h2>Por fuente (UTM)</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Fuente</th><th>Leads</th></tr></thead>
        <tbody>{[...porFuente.entries()].sort((a, b) => b[1] - a[1]).map(([f, c]) => <tr key={f}><td>{f}</td><td className="num">{c}</td></tr>)}</tbody>
      </table></div>

      <h2>Por vendedor</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Vendedor</th><th>Citas</th><th>Asistieron</th><th>No asistieron</th><th>Ventas</th><th>Cobrado (USD)</th></tr></thead>
        <tbody>{(equipo ?? []).map((s) => {
          const mias = C.filter((c) => c.seller_id === s.id);
          const vs = V.filter((v) => v.seller_id === s.id);
          const cobrado = vs.filter((v) => v.moneda === "USD").reduce((t, v) => t + Number(v.monto_abonado), 0);
          return (
            <tr key={s.id}>
              <td>{s.nombre} <span className="muted small">{s.tipo}</span></td>
              <td className="num">{mias.length}</td>
              <td className="num">{mias.filter((c) => c.estado === "atendida").length}</td>
              <td className="num">{mias.filter((c) => c.estado === "no_asistio").length}</td>
              <td className="num">{vs.length}</td>
              <td className="num">{dinero(cobrado)}</td>
            </tr>
          );
        })}</tbody>
      </table></div>
    </>
  );
}
