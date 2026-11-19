import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { ESTADO_CITA_LABEL, fechaHora } from "@/lib/format";
import { cambiarEstadoCita, reagendarCita } from "./actions";

type Props = { searchParams: Promise<{ ver?: string }> };
type Rel = { id?: string; nombre: string } | { id?: string; nombre: string }[] | null;
const uno = (r: Rel) => (Array.isArray(r) ? r[0] : r);

export default async function CitasPage({ searchParams }: Props) {
  const { supabase } = await requireSeller();
  const { ver = "proximas" } = await searchParams;
  const ahora = new Date().toISOString();

  let q = supabase.from("citas").select("id, start_at, end_at, estado, notas, leads(id, nombre), sellers(nombre)");
  if (ver === "proximas") q = q.gte("start_at", ahora).in("estado", ["agendada", "reagendada"]).order("start_at");
  else if (ver === "vencidas") q = q.lt("end_at", ahora).in("estado", ["agendada", "reagendada"]).order("start_at");
  else q = q.order("start_at", { ascending: false }).limit(200);
  const { data: citas } = await q;

  const tabs = [["proximas", "Próximas"], ["vencidas", "Vencidas sin cerrar"], ["todas", "Todas"]];

  return (
    <>
      <h1>Citas</h1>
      <p className="muted">Para una cita que ya pasó sin atenderse, márcala como &quot;No asistió&quot; y agenda una nueva desde el lead — una cita vencida no se reagenda.</p>
      <div className="row" style={{ margin: "14px 0" }}>
        {tabs.map(([k, l]) => <Link key={k} href={`/panel/citas?ver=${k}`} className={`pill ${ver === k ? "red" : ""}`}>{l}</Link>)}
      </div>

      <div className="table-wrap"><table>
        <thead><tr><th>Fecha</th><th>Lead</th><th>Closer</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {(citas ?? []).length === 0 && <tr><td colSpan={5} className="muted">Nada por aquí.</td></tr>}
          {(citas ?? []).map((c) => {
            const lead = uno(c.leads as Rel);
            const activa = c.estado === "agendada" || c.estado === "reagendada";
            const futura = new Date(c.start_at).getTime() > Date.now();
            return (
              <tr key={c.id}>
                <td>{fechaHora(c.start_at)}</td>
                <td>{lead?.id ? <Link href={`/panel/leads/${lead.id}`}>{lead.nombre}</Link> : "—"}</td>
                <td>{uno(c.sellers as Rel)?.nombre ?? "—"}</td>
                <td><span className="pill">{ESTADO_CITA_LABEL[c.estado]}</span></td>
                <td>
                  {activa && (
                    <form action={cambiarEstadoCita.bind(null, c.id)} className="inline">
                      <select name="estado" aria-label="Cerrar cita" defaultValue="atendida">
                        <option value="atendida">Asistió</option>
                        <option value="no_asistio">No asistió</option>
                        <option value="cancelada">Cancelar</option>
                      </select>
                      <button type="submit" className="ghost">Guardar</button>
                    </form>
                  )}
                  {activa && futura && (
                    <details style={{ marginTop: 6 }}>
                      <summary className="small">Reagendar</summary>
                      <ActionForm action={reagendarCita.bind(null, c.id)} submit="Reagendar" className="inline">
                        <label>Nueva fecha y hora<input name="inicio" type="datetime-local" required /></label>
                        <label>Duración<input name="duracion" type="number" min={15} max={240} step={15} defaultValue={45} /></label>
                      </ActionForm>
                    </details>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </>
  );
}
