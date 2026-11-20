import { requireGestor } from "@/lib/auth";
import { boldConfigurado } from "@/lib/bold";
import { activarPendientes } from "@/lib/workshop-acceso";
import { fecha, fechaHora } from "@/lib/format";
import { AccionesInscripcion, ESTADO_INSC } from "./acciones";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ dias?: string }> };
type Rel<T> = T | T[] | null;
const uno = <T,>(r: Rel<T>): T | null => (Array.isArray(r) ? r[0] ?? null : r);
const dinero = (n: number, m: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: m, maximumFractionDigits: m === "COP" ? 0 : 2 }).format(n);
const diaBog = (d: string | number) => new Date(new Date(d).getTime() - 5 * 3600_000).toISOString().slice(0, 10);

type Fila = {
  id: string; estado: string; origen: string; moneda: string | null; monto: number | null; pais: string | null;
  utm_source: string | null; utm_campaign: string | null; created_at: string; activada_at: string | null; vence_at: string | null;
  reembolsada_at: string | null; acceso_detalle: string | null;
  alumnos: Rel<{ nombre: string; email: string; whatsapp: string | null }>;
  cobros: Rel<{ estado: string; monto: number; moneda: string; pagado_at: string | null }>;
};

// Ventas de ALMA: cobros de Bold e inscripciones, ingresos por moneda, por día y devoluciones.
export default async function VentasWorkshop({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  if (boldConfigurado()) await activarPendientes(); // al abrir, revisa en Bold los pagos pendientes (como Cobros)
  const { dias = "30" } = await searchParams;
  const n = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const desde = Date.now() - n * 86400_000;

  const { data } = await supabase.from("inscripciones")
    .select("id, estado, origen, moneda, monto, pais, utm_source, utm_campaign, created_at, activada_at, vence_at, reembolsada_at, acceso_detalle, alumnos(nombre, email, whatsapp), cobros(estado, monto, moneda, pagado_at)")
    .order("created_at", { ascending: false }).limit(1000);
  const filas = (data ?? []) as Fila[];

  // Venta = inscripción pagada por Bold (cobro pagado). Las manuales no suman ingresos.
  const pagadas = filas.filter((f) => uno(f.cobros)?.estado === "pagado");
  const vigentes = pagadas.filter((f) => f.estado !== "reembolsada");
  const enPeriodo = (f: Fila) => new Date(uno(f.cobros)?.pagado_at ?? f.activada_at ?? f.created_at).getTime() >= desde;
  const suma = (fs: Fila[], m: string) => fs.filter((f) => uno(f.cobros)?.moneda === m).reduce((t, f) => t + Number(uno(f.cobros)?.monto ?? 0), 0);
  const P = vigentes.filter(enPeriodo);
  const reembolsos = filas.filter((f) => f.estado === "reembolsada");

  const porDia = new Map<string, { cop: number; usd: number; nCop: number; nUsd: number }>();
  for (const f of P) {
    const c = uno(f.cobros)!;
    const d = diaBog(c.pagado_at ?? f.activada_at ?? f.created_at);
    const x = porDia.get(d) ?? { cop: 0, usd: 0, nCop: 0, nUsd: 0 };
    if (c.moneda === "COP") { x.cop += Number(c.monto); x.nCop++; } else { x.usd += Number(c.monto); x.nUsd++; }
    porDia.set(d, x);
  }
  const serie = Array.from({ length: n }, (_, i) => diaBog(Date.now() - (n - 1 - i) * 86400_000));
  const maxDia = Math.max(1, ...serie.map((d) => (porDia.get(d)?.nCop ?? 0) + (porDia.get(d)?.nUsd ?? 0)));

  return (
    <>
      {!boldConfigurado() && <div className="alert error">Bold no está conectado (falta BOLD_API_KEY): no se pueden crear links ni confirmar pagos automáticamente. Usa «Dar acceso manual» en Alumnos.</div>}
      <div className="row" style={{ margin: "10px 0 14px" }}>
        {[7, 30, 90].map((d) => <a key={d} href={`/panel/workshop?dias=${d}`} className={`pill ${n === d ? "red" : ""}`}>Últimos {d} días</a>)}
      </div>

      <div className="grid">
        <div className="card stat"><div className="n">{dinero(suma(P, "COP"), "COP")}</div><div className="l">Ingresos COP · {P.filter((f) => uno(f.cobros)?.moneda === "COP").length} ventas</div></div>
        <div className="card stat"><div className="n">{dinero(suma(P, "USD"), "USD")}</div><div className="l">Ingresos USD · {P.filter((f) => uno(f.cobros)?.moneda === "USD").length} ventas</div></div>
        <div className="card stat"><div className="n">{filas.filter((f) => f.estado === "activa").length}</div><div className="l">Alumnos activos (total)</div></div>
        <div className="card stat"><div className="n">{filas.filter((f) => f.estado === "pendiente_pago").length}</div><div className="l">Esperando pago</div></div>
        <div className="card stat"><div className="n">{reembolsos.length}</div><div className="l">Reembolsos ({dinero(suma(reembolsos.filter((f) => uno(f.cobros)?.estado === "pagado"), "COP"), "COP")} · {dinero(suma(reembolsos.filter((f) => uno(f.cobros)?.estado === "pagado"), "USD"), "USD")})</div></div>
      </div>

      <h2>Ventas por día</h2>
      <div className="card">
        <div className="dias" role="img" aria-label="Ventas de ALMA por día">
          {serie.map((d) => {
            const x = porDia.get(d);
            const v = (x?.nCop ?? 0) + (x?.nUsd ?? 0);
            return <span key={d} title={`${d}: ${v} ventas${x ? ` · ${dinero(x.cop, "COP")} · ${dinero(x.usd, "USD")}` : ""}`} className={v ? "" : "cero"} style={{ height: `${v ? Math.max(6, (v / maxDia) * 100) : 2}%` }} />;
          })}
        </div>
        <div className="row muted small" style={{ justifyContent: "space-between" }}><span>{serie[0]}</span><span>máximo {maxDia} por día</span><span>{serie[serie.length - 1]}</span></div>
      </div>
      {porDia.size > 0 && (
        <div className="table-wrap" style={{ marginTop: 10 }}><table>
          <thead><tr><th>Día</th><th>Ventas COP</th><th>Ingresos COP</th><th>Ventas USD</th><th>Ingresos USD</th></tr></thead>
          <tbody>{[...porDia.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([d, x]) => (
            <tr key={d}><td>{d}</td><td className="num">{x.nCop}</td><td className="num">{dinero(x.cop, "COP")}</td><td className="num">{x.nUsd}</td><td className="num">{dinero(x.usd, "USD")}</td></tr>
          ))}</tbody>
        </table></div>
      )}

      <h2>Inscripciones</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Alumno</th><th>Estado</th><th>Pago</th><th>Origen</th><th>Acceso</th><th>Acciones</th></tr></thead>
        <tbody>
          {filas.length === 0 && <tr><td colSpan={6} className="muted">Todavía no hay inscripciones.</td></tr>}
          {filas.slice(0, 200).map((f) => {
            const a = uno(f.alumnos), c = uno(f.cobros);
            const [label, pill] = ESTADO_INSC[f.estado] ?? [f.estado, ""];
            const vencida = Boolean(f.vence_at && new Date(f.vence_at).getTime() <= Date.now());
            return (
              <tr key={f.id}>
                <td><strong>{a?.nombre}</strong><div className="muted small">{a?.email}</div><div className="muted small">{fechaHora(f.created_at)}{f.pais ? ` · ${f.pais}` : ""}</div></td>
                <td><span className={`pill ${pill}`}>{vencida && f.estado === "activa" ? "Vencida" : label}</span></td>
                <td>{c ? <>{dinero(Number(c.monto), c.moneda)}<div className="muted small">Bold: {c.estado}</div></> : <span className="muted small">—</span>}</td>
                <td>{f.origen === "manual" ? "Manual" : "Bold"}{f.utm_source && <div className="muted small">{f.utm_source}{f.utm_campaign ? ` · ${f.utm_campaign}` : ""}</div>}</td>
                <td className="small">{f.vence_at ? `Hasta ${fecha(f.vence_at)}` : "—"}{f.acceso_detalle && <div className="muted small" title={f.acceso_detalle}>{f.acceso_detalle.slice(0, 70)}</div>}</td>
                <td><AccionesInscripcion id={f.id} estado={f.estado} vencida={vencida} /></td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </>
  );
}
