import { requireGestor } from "@/lib/auth";
import { WORKSHOP } from "@/lib/workshop";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ dias?: string; por?: string }> };
type Ev = { evento: string; sesion: string; utm_source: string | null; utm_campaign: string | null; utm_content: string | null; dispositivo: string | null };

const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");
const PASOS = [
  ["workshop_vista", "Visitaron la landing"],
  ["workshop_video_play", "Le dieron play al video"],
  ["workshop_cta", "Clic en «Quiero entrar»"],
  ["workshop_checkout", "Llegaron al pago (Bold)"],
  ["workshop_pago", "Pagaron"],
  ["workshop_acceso", "Entraron al curso"],
] as const;
const DIMENSIONES = { utm_source: "Fuente", utm_campaign: "Campaña", utm_content: "Anuncio" } as const;

// Embudo de ALMA: personas únicas (sesión del navegador) por paso, conversión entre pasos y por UTM,
// y el puente ALMA → 5 preguntas → diagnóstico → implementación.
export default async function EmbudoWorkshop({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  const { dias = "30", por = "utm_source" } = await searchParams;
  const n = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const dim = (por in DIMENSIONES ? por : "utm_source") as keyof typeof DIMENSIONES;
  const desde = new Date(Date.now() - n * 86400_000).toISOString();

  const [{ data: evs }, { data: insc }] = await Promise.all([
    supabase.from("embudo_eventos").select("evento, sesion, utm_source, utm_campaign, utm_content, dispositivo").eq("embudo", WORKSHOP.embudo).gte("created_at", desde).limit(50000),
    supabase.from("inscripciones").select("estado, origen, activada_at, alumnos(email)").eq("estado", "activa").gte("activada_at", desde),
  ]);
  const E = (evs ?? []) as Ev[];
  const ses = (ev: string, filtro?: (e: Ev) => boolean) => new Set(E.filter((e) => e.evento === ev && (!filtro || filtro(e))).map((e) => e.sesion)).size;
  const pasos = PASOS.map(([ev, nombre]) => ({ ev, nombre, n: ses(ev) }));
  const tope = Math.max(1, ...pasos.map((p) => p.n));
  const vistas = E.filter((e) => e.evento === "workshop_vista");
  const movil = vistas.filter((e) => e.dispositivo === "movil").length;
  const fuga = pasos.slice(1)
    .map((p, i) => ({ de: pasos[i].nombre, a: p.nombre, perdida: pasos[i].n - p.n, tasa: pasos[i].n ? p.n / pasos[i].n : 1 }))
    .filter((f) => f.perdida > 0).sort((a, b) => a.tasa - b.tasa)[0];

  // Por UTM: la sesión hereda los UTMs de su primera visita (sessionStorage), así que cada paso trae los mismos.
  const valores = new Set(E.map((e) => e[dim] ?? ""));
  const filas = [...valores].map((v) => {
    const f = (e: Ev) => (e[dim] ?? "") === v;
    return { v: v || "(directo / sin UTM)", pasos: PASOS.map(([ev]) => ses(ev, f)) };
  }).sort((a, b) => b.pasos[0] - a.pasos[0] || b.pasos[4] - a.pasos[4]);

  // Puente a la agencia: alumnos activados en el periodo cuyo correo aplicó (5 preguntas), agendó o compró.
  const correos = [...new Set((insc ?? []).map((i) => {
    const a = Array.isArray(i.alumnos) ? i.alumnos[0] : i.alumnos;
    return (a as { email?: string } | null)?.email;
  }).filter(Boolean) as string[])];
  const manuales = (insc ?? []).filter((i) => i.origen === "manual").length;
  let aplicaron = 0, agendaron = 0, compraron = 0;
  if (correos.length) {
    const { data: leads } = await supabase.from("leads").select("id, email").in("email", correos.slice(0, 1000));
    const ids = (leads ?? []).map((l) => l.id);
    aplicaron = new Set((leads ?? []).map((l) => l.email)).size;
    if (ids.length) {
      const [{ data: citas }, { data: ventas }] = await Promise.all([
        supabase.from("citas").select("lead_id").in("lead_id", ids),
        supabase.from("ventas").select("lead_id").in("lead_id", ids),
      ]);
      const emailDe = new Map((leads ?? []).map((l) => [l.id, l.email]));
      agendaron = new Set((citas ?? []).map((c) => emailDe.get(c.lead_id))).size;
      compraron = new Set((ventas ?? []).map((v) => emailDe.get(v.lead_id))).size;
    }
  }
  const puente = [
    { nombre: "Alumnos activados", n: correos.length },
    { nombre: "Respondieron las 5 preguntas", n: aplicaron },
    { nombre: "Agendaron diagnóstico", n: agendaron },
    { nombre: "Compraron la implementación", n: compraron },
  ];

  return (
    <>
      <div className="row" style={{ margin: "10px 0 14px" }}>
        {[7, 30, 90].map((d) => <a key={d} href={`/panel/workshop/embudo?dias=${d}&por=${dim}`} className={`pill ${n === d ? "red" : ""}`}>Últimos {d} días</a>)}
      </div>

      <h2 style={{ marginTop: 6 }}>Embudo de ALMA paso a paso</h2>
      <p className="muted small" style={{ marginTop: -4 }}>
        Personas únicas en cada paso · {vistas.length ? `${Math.round((movil / vistas.length) * 100)}% entra desde el celular` : "aún sin visitas en este periodo"}
        {manuales ? ` · ${manuales} accesos manuales no cuentan en el embudo` : ""}
      </p>
      <div className="card embudo-pasos">
        {pasos.map((p, i) => (
          <div key={p.ev} className="paso">
            <div className="paso-txt">
              <span>{p.nombre}</span>
              <span className="num"><strong>{p.n}</strong>{i > 0 && <span className="muted"> · {pct(p.n, pasos[i - 1].n)} del paso anterior</span>}</span>
            </div>
            <div className="paso-barra"><span style={{ width: `${p.n ? Math.max(2, (p.n / tope) * 100) : 0}%` }} /></div>
          </div>
        ))}
        <p className="muted small" style={{ margin: 0 }}>Conversión total visita → pago: <strong>{pct(pasos[4].n, pasos[0].n)}</strong></p>
        {fuga && <p className="paso-alerta">Donde más gente se va: de <strong>{fuga.de.toLowerCase()}</strong> a <strong>{fuga.a.toLowerCase()}</strong> (sigue el {Math.round(fuga.tasa * 100)}%, se pierden {fuga.perdida}).</p>}
      </div>

      <h2>Por UTM</h2>
      <div className="row" style={{ marginBottom: 10 }}>
        {Object.entries(DIMENSIONES).map(([k, l]) => <a key={k} href={`/panel/workshop/embudo?dias=${n}&por=${k}`} className={`pill ${dim === k ? "red" : ""}`}>{l}</a>)}
      </div>
      <div className="table-wrap"><table>
        <thead><tr><th>{DIMENSIONES[dim]}</th><th>Visitas</th><th>Play</th><th>CTA</th><th>Checkout</th><th>Pagos</th><th>Acceso</th><th>Visita → pago</th></tr></thead>
        <tbody>
          {filas.length === 0 && <tr><td colSpan={8} className="muted">Sin datos en este periodo.</td></tr>}
          {filas.map((f) => (
            <tr key={f.v}><td>{f.v}</td>{f.pasos.map((x, i) => <td key={i} className="num">{x}</td>)}<td className="num">{pct(f.pasos[4], f.pasos[0])}</td></tr>
          ))}
        </tbody>
      </table></div>

      <h2>De ALMA a la agencia</h2>
      <p className="muted small" style={{ marginTop: -4 }}>Alumnos activados en el periodo cuyo correo aparece en las aplicaciones (5 preguntas), las citas y las ventas del embudo de Conexión.</p>
      <div className="card embudo-pasos">
        {puente.map((p, i) => (
          <div key={p.nombre} className="paso">
            <div className="paso-txt"><span>{p.nombre}</span><span className="num"><strong>{p.n}</strong>{i > 0 && <span className="muted"> · {pct(p.n, puente[i - 1].n)} del paso anterior</span>}</span></div>
            <div className="paso-barra"><span style={{ width: `${p.n ? Math.max(2, (p.n / Math.max(1, puente[0].n)) * 100) : 0}%` }} /></div>
          </div>
        ))}
      </div>
    </>
  );
}
