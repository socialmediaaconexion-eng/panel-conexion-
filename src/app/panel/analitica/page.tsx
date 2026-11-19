import { requireGestor } from "@/lib/auth";
import { dinero } from "@/lib/format";

type Props = { searchParams: Promise<{ dias?: string }> };

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");

export default async function AnaliticaPage({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  const { dias = "30" } = await searchParams;
  const n = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const desde = new Date(Date.now() - n * 86400_000).toISOString();

  const [{ data: leads }, { data: citas }, { data: ventas }, { data: equipo }, { data: eventos }] = await Promise.all([
    supabase.from("leads").select("id, embudo, etapa, utm_source").gte("created_at", desde),
    supabase.from("citas").select("lead_id, seller_id, estado, start_at").gte("start_at", desde),
    supabase.from("ventas").select("lead_id, seller_id, moneda, monto_total, monto_abonado").gte("created_at", desde),
    supabase.from("sellers").select("id, nombre, tipo").eq("activo", true).order("nombre"),
    supabase.from("embudo_eventos").select("evento, sesion, utm_source, dispositivo, created_at").gte("created_at", desde).limit(50000),
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

  // ---- Embudo VSL: personas (sesiones) únicas por paso ----
  const E = eventos ?? [];
  const ses = (ev: string) => new Set(E.filter((e) => e.evento === ev).map((e) => e.sesion));
  const LV = L.filter((l) => l.embudo === "vsl-conexion");
  const conCita = new Set(C.map((c) => c.lead_id));
  const conVenta = new Set(V.map((v) => v.lead_id));
  const pasos: { nombre: string; n: number }[] = [
    { nombre: "Visitaron el VSL", n: ses("vsl_vista").size },
    { nombre: "Le dieron play al video", n: ses("video_play").size },
    { nombre: "Vieron la mitad del video", n: ses("video_50").size },
    { nombre: "Vieron el video completo", n: ses("video_100").size },
    { nombre: "Clic en «Aplicar»", n: ses("cta_aplicar").size },
    { nombre: "Abrieron el formulario", n: ses("aplicar_vista").size },
    { nombre: "Enviaron la aplicación", n: LV.length },
    { nombre: "Agendaron la llamada", n: LV.filter((l) => conCita.has(l.id)).length },
    { nombre: "Compraron", n: LV.filter((l) => conVenta.has(l.id)).length },
  ];
  const tope = Math.max(1, ...pasos.map((p) => p.n));
  const fuga = pasos.slice(1)
    .map((p, i) => ({ de: pasos[i].nombre, a: p.nombre, perdida: pasos[i].n - p.n, tasa: pasos[i].n ? p.n / pasos[i].n : 1 }))
    .filter((f) => f.perdida > 0).sort((a, b) => a.tasa - b.tasa)[0];

  const diaBog = (d: string | number) => new Date(new Date(d).getTime() - 5 * 3600_000).toISOString().slice(0, 10);
  const vistasVsl = E.filter((e) => e.evento === "vsl_vista");
  const visitasDia = new Map<string, number>();
  for (const e of vistasVsl) visitasDia.set(diaBog(e.created_at), (visitasDia.get(diaBog(e.created_at)) ?? 0) + 1);
  const serieDias = Array.from({ length: n }, (_, i) => diaBog(Date.now() - (n - 1 - i) * 86400_000));
  const maxDia = Math.max(0, ...serieDias.map((d) => visitasDia.get(d) ?? 0));
  const movil = vistasVsl.filter((e) => e.dispositivo === "movil").length;

  const porFuente = new Map<string, { visitas: number; leads: number; agendas: number }>();
  const fila = (k: string | null) => {
    const key = k || "(directo / sin UTM)";
    const f = porFuente.get(key) ?? { visitas: 0, leads: 0, agendas: 0 };
    porFuente.set(key, f);
    return f;
  };
  for (const e of vistasVsl) fila(e.utm_source).visitas++;
  for (const l of L) { const f = fila(l.utm_source); f.leads++; if (conCita.has(l.id)) f.agendas++; }

  return (
    <>
      <h1>Analítica</h1>
      <div className="row" style={{ margin: "10px 0 16px" }}>
        {[7, 30, 90].map((d) => <a key={d} href={`/panel/analitica?dias=${d}`} className={`pill ${n === d ? "red" : ""}`}>Últimos {d} días</a>)}
      </div>

      <h2 style={{ marginTop: 6 }}>Embudo VSL paso a paso</h2>
      <p className="muted small" style={{ marginTop: -4 }}>
        Personas únicas en cada paso · {vistasVsl.length ? `${Math.round((movil / vistasVsl.length) * 100)}% entra desde el celular` : "aún sin visitas registradas en este periodo"}
      </p>
      <div className="card embudo-pasos">
        {pasos.map((p, i) => (
          <div key={p.nombre} className="paso">
            <div className="paso-txt">
              <span>{p.nombre}</span>
              <span className="num"><strong>{p.n}</strong>{i > 0 && <span className="muted"> · {pct(p.n, pasos[i - 1].n)} del paso anterior</span>}</span>
            </div>
            <div className="paso-barra"><span style={{ width: `${p.n ? Math.max(2, (p.n / tope) * 100) : 0}%` }} /></div>
          </div>
        ))}
        {fuga && (
          <p className="paso-alerta">
            Donde más gente se va: de <strong>{fuga.de.toLowerCase()}</strong> a <strong>{fuga.a.toLowerCase()}</strong> (sigue el {Math.round(fuga.tasa * 100)}%, se pierden {fuga.perdida}). Ese es el paso a mejorar primero.
          </p>
        )}
      </div>

      <h2>Visitas al VSL por día</h2>
      <div className="card">
        <div className="dias" role="img" aria-label="Visitas al VSL por día">
          {serieDias.map((d) => {
            const v = visitasDia.get(d) ?? 0;
            return <span key={d} title={`${d}: ${v} visitas`} className={v ? "" : "cero"} style={{ height: `${v && maxDia ? Math.max(4, (v / maxDia) * 100) : 2}%` }} />;
          })}
        </div>
        <div className="row muted small" style={{ justifyContent: "space-between" }}><span>{serieDias[0]}</span><span>máximo {maxDia} por día</span><span>{serieDias[serieDias.length - 1]}</span></div>
      </div>

      <h2>Resultados comerciales</h2>
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
        <thead><tr><th>Fuente</th><th>Visitas VSL</th><th>Leads</th><th>Visita → lead</th><th>Agendaron</th></tr></thead>
        <tbody>
          {porFuente.size === 0 && <tr><td colSpan={5} className="muted">Sin datos en este periodo.</td></tr>}
          {[...porFuente.entries()].sort((a, b) => b[1].visitas + b[1].leads - (a[1].visitas + a[1].leads)).map(([f, c]) => (
            <tr key={f}><td>{f}</td><td className="num">{c.visitas}</td><td className="num">{c.leads}</td><td className="num">{pct(c.leads, c.visitas)}</td><td className="num">{c.agendas}</td></tr>
          ))}
        </tbody>
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
