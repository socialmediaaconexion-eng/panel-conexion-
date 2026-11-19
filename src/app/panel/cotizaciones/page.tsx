import { requireGestor } from "@/lib/auth";
import { fechaHora, waLink } from "@/lib/format";
import { ESTADOS_COTIZACION } from "@/lib/cotizaciones";
import { actualizarCotizacion } from "./actions";

type Props = { searchParams: Promise<{ estado?: string }> };

const PILL: Record<string, string> = { nueva: "red", en_preparacion: "warn", enviada: "", aceptada: "good", descartada: "" };

export default async function CotizacionesPage({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  const { estado } = await searchParams;
  let q = supabase.from("cotizaciones").select("*").order("created_at", { ascending: false }).limit(200);
  if (estado && estado in ESTADOS_COTIZACION) q = q.eq("estado", estado);
  const { data } = await q;
  const filas = data ?? [];
  const nuevas = filas.filter((c) => c.estado === "nueva").length;
  const n8nOk = Boolean(process.env.N8N_COTIZACIONES_WEBHOOK);

  return (
    <>
      <h1>Cotizaciones</h1>
      <p className="muted">Solicitudes desde conexionteam.app/cotizar. {n8nOk ? "n8n envía los correos automáticamente." : "n8n aún no está conectado: las cotizaciones se guardan pero no salen correos."}</p>
      <div className="row" style={{ margin: "12px 0" }}>
        <a href="/panel/cotizaciones" className={`pill ${!estado ? "red" : ""}`}>Todas</a>
        {Object.entries(ESTADOS_COTIZACION).map(([k, v]) => <a key={k} href={`/panel/cotizaciones?estado=${k}`} className={`pill ${estado === k ? "red" : ""}`}>{v}</a>)}
        {nuevas > 0 && !estado && <span className="pill red">{nuevas} sin responder</span>}
      </div>

      {filas.length === 0 && <div className="card muted">Todavía no hay cotizaciones{estado ? " con este estado" : ""}.</div>}
      <div className="cot-lista">
        {filas.map((c) => {
          const wa = waLink(c.telefono, `Hola ${c.nombre.split(" ")[0]}, te escribo de Conexión por tu cotización.`);
          return (
            <article key={c.id} className="card cot">
              <header className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{c.nombre}</strong>{c.empresa && <span className="muted"> · {c.empresa}</span>}
                  <div className="muted small">{fechaHora(c.created_at)}{c.pais ? ` · ${c.pais}` : ""}{c.utm_source ? ` · llegó de ${c.utm_source}` : ""}</div>
                </div>
                <span className={`pill ${PILL[c.estado] ?? ""}`}>{ESTADOS_COTIZACION[c.estado]}</span>
              </header>
              <div className="row" style={{ gap: 6, margin: "10px 0" }}>{(c.piezas as string[]).map((p) => <span key={p} className="pill">{p}</span>)}</div>
              <dl className="cot-datos">
                <dt>Correo</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd>
                {c.telefono && <><dt>WhatsApp</dt><dd>{wa ? <a href={wa} target="_blank" rel="noopener">{c.telefono}</a> : c.telefono}</dd></>}
                {c.presupuesto && <><dt>Presupuesto</dt><dd>{c.presupuesto}</dd></>}
                {c.plazo && <><dt>Plazo</dt><dd>{c.plazo}</dd></>}
                {c.mensaje && <><dt>Proyecto</dt><dd>{c.mensaje}</dd></>}
                <dt>Correos n8n</dt><dd className="muted small">{c.n8n_estado ?? "—"}</dd>
              </dl>
              <form action={actualizarCotizacion.bind(null, c.id)} className="inline">
                <label>Estado
                  <select name="estado" defaultValue={c.estado}>{Object.entries(ESTADOS_COTIZACION).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                </label>
                <label style={{ flex: 1, minWidth: 200 }}>Notas internas<input name="notas" defaultValue={c.notas ?? ""} placeholder="Qué se propuso, precio, próximos pasos…" /></label>
                <button type="submit">Guardar</button>
              </form>
            </article>
          );
        })}
      </div>
    </>
  );
}
