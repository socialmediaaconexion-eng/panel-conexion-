import { ETIQUETAS_RESPUESTA } from "@/lib/preguntas";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSeller, esGestor } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { ETAPAS, ETAPA_LABEL, ESTADO_CITA_LABEL, dinero, fecha, fechaHora, waLink } from "@/lib/format";
import { cambiarEtapa, guardarNotas, reasignar } from "../actions";
import { agendarCita } from "../../citas/actions";
import { registrarVenta } from "../../ventas/actions";

type Props = { params: Promise<{ id: string }> };

type Rel = { nombre: string } | { nombre: string }[] | null;
const nombreDe = (r: Rel) => (Array.isArray(r) ? r[0]?.nombre : r?.nombre) ?? "—";

export default async function LeadDetalle({ params }: Props) {
  const { id } = await params;
  const { seller, supabase } = await requireSeller();
  const gestor = esGestor(seller);

  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();

  const [asignaciones, citas, ventas, equipo] = await Promise.all([
    supabase.from("lead_assignments").select("id, motivo, activo, created_at, sellers!lead_assignments_seller_id_fkey(nombre)").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("citas").select("id, start_at, estado, notas, sellers(nombre)").eq("lead_id", id).order("start_at", { ascending: false }),
    supabase.from("ventas").select("id, producto, moneda, monto_total, monto_abonado, estado, created_at").eq("lead_id", id).order("created_at", { ascending: false }),
    gestor ? supabase.from("sellers").select("id, nombre, tipo").eq("activo", true).order("nombre") : Promise.resolve({ data: [] }),
  ]);

  const actual = asignaciones.data?.find((a) => a.activo);
  const wa = waLink(lead.telefono, `Hola ${lead.nombre.split(" ")[0]}, te escribo de Conexión.`);

  return (
    <>
      <p className="small"><Link href="/panel/leads">← Leads</Link></p>
      <h1>{lead.nombre}</h1>
      <div className="row muted">
        <span>{lead.email}</span>
        {lead.telefono && <span>{lead.telefono}</span>}
        <span>Embudo: {lead.embudo}</span>
        <span>Entró: {fecha(lead.created_at)}</span>
        {wa && <a className="btn" href={wa} target="_blank" rel="noopener">Escribir por WhatsApp</a>}
      </div>

      {lead.respuestas && (
        <div className="card" style={{ marginTop: 18 }}>
          <h2 style={{ marginTop: 0 }}>Respuestas de la aplicación</h2>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 14px" }}>
            {Object.keys(lead.respuestas as Record<string, string>).map((k) => [k, ETIQUETAS_RESPUESTA[k] ?? k]).map(([k, l]) => (
              <Fragment key={k}><dt className="muted">{l}</dt><dd style={{ margin: 0 }}>{(lead.respuestas as Record<string, string>)[k] || "—"}</dd></Fragment>
            ))}
          </dl>
        </div>
      )}

      <div className="grid" style={{ marginTop: 18 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Etapa</h2>
          <form action={cambiarEtapa.bind(null, id)} className="inline">
            <label htmlFor="etapa">Etapa actual
              <select id="etapa" name="etapa" defaultValue={lead.etapa}>
                {ETAPAS.map((e) => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
              </select>
            </label>
            <button type="submit" className="ghost">Cambiar</button>
          </form>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Dueño</h2>
          <p>{actual ? nombreDe(actual.sellers as Rel) : <span className="pill red">Sin dueño</span>}</p>
          {gestor && (
            <ActionForm action={reasignar.bind(null, id)} submit="Reasignar" className="inline">
              <label htmlFor="seller_id">Pasar a
                <select id="seller_id" name="seller_id" required>
                  {(equipo.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.nombre} ({s.tipo})</option>)}
                </select>
              </label>
            </ActionForm>
          )}
        </div>
      </div>

      <h2>Notas</h2>
      <form action={guardarNotas.bind(null, id)} className="stack" style={{ maxWidth: 640 }}>
        <label htmlFor="notas" className="sr-only">Notas del lead</label>
        <textarea id="notas" name="notas" rows={4} defaultValue={lead.notas ?? ""} />
        <div><button type="submit" className="ghost">Guardar notas</button></div>
      </form>

      <h2>Citas</h2>
      {(citas.data ?? []).length === 0 ? <p className="muted">Sin citas todavía.</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Fecha</th><th>Closer</th><th>Estado</th><th>Notas</th></tr></thead>
          <tbody>{citas.data!.map((c) => (
            <tr key={c.id}><td>{fechaHora(c.start_at)}</td><td>{nombreDe(c.sellers as Rel)}</td><td>{ESTADO_CITA_LABEL[c.estado]}</td><td>{c.notas ?? ""}</td></tr>
          ))}</tbody>
        </table></div>
      )}
      <div className="spacer" />
      <ActionForm action={agendarCita.bind(null, id)} submit="Agendar cita" className="inline">
        <label htmlFor="inicio">Fecha y hora (Colombia)<input id="inicio" name="inicio" type="datetime-local" required /></label>
        <label htmlFor="duracion">Duración (min)<input id="duracion" name="duracion" type="number" min={15} max={240} step={15} defaultValue={45} /></label>
        <label htmlFor="cita-notas">Notas<input id="cita-notas" name="notas" /></label>
      </ActionForm>

      <h2>Ventas</h2>
      {(ventas.data ?? []).length === 0 ? <p className="muted">Sin ventas registradas.</p> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Producto</th><th>Total</th><th>Abonado</th><th>Estado</th><th>Fecha</th></tr></thead>
          <tbody>{ventas.data!.map((v) => (
            <tr key={v.id}>
              <td>{v.producto}</td>
              <td className="num">{dinero(Number(v.monto_total), v.moneda)}</td>
              <td className="num">{dinero(Number(v.monto_abonado), v.moneda)}</td>
              <td><span className={`pill ${v.estado === "pagada" ? "good" : "warn"}`}>{v.estado === "pagada" ? "Pagada" : "Con saldo"}</span></td>
              <td>{fecha(v.created_at)}</td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <div className="spacer" />
      <ActionForm action={registrarVenta.bind(null, id)} submit="Registrar venta" className="inline">
        <label htmlFor="producto">Producto / servicio<input id="producto" name="producto" required /></label>
        <label htmlFor="moneda">Moneda
          <select id="moneda" name="moneda" defaultValue="USD"><option>USD</option><option>COP</option><option>MXN</option></select>
        </label>
        <label htmlFor="monto_total">Total<input id="monto_total" name="monto_total" type="number" min={0.01} step={0.01} required /></label>
        <label htmlFor="monto_abonado">Abonado hoy<input id="monto_abonado" name="monto_abonado" type="number" min={0} step={0.01} defaultValue={0} /></label>
      </ActionForm>

      <h2>Historial de dueños</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Fecha</th><th>Vendedor</th><th>Motivo</th><th></th></tr></thead>
        <tbody>{(asignaciones.data ?? []).map((a) => (
          <tr key={a.id}><td>{fechaHora(a.created_at)}</td><td>{nombreDe(a.sellers as Rel)}</td><td>{a.motivo}</td><td>{a.activo && <span className="pill good">Actual</span>}</td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
