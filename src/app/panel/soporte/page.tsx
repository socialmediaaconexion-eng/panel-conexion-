import { requireSeller } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { fecha } from "@/lib/format";
import { crearTicket, actualizarTicket } from "./actions";

type Props = { searchParams: Promise<{ ver?: string }> };
type Rel = { nombre: string } | { nombre: string }[] | null;
const nombreDe = (r: Rel) => (Array.isArray(r) ? r[0]?.nombre : r?.nombre) ?? "—";

export default async function SoportePage({ searchParams }: Props) {
  const { supabase } = await requireSeller();
  const { ver = "abiertos" } = await searchParams;

  let q = supabase.from("tickets")
    .select("id, asunto, descripcion, estado, prioridad, asignado_a, created_at, creador:sellers!tickets_creado_por_fkey(nombre)")
    .order("created_at", { ascending: false });
  if (ver === "abiertos") q = q.neq("estado", "cerrado");
  const [{ data: tickets }, { data: equipo }] = await Promise.all([
    q,
    supabase.from("sellers").select("id, nombre").eq("activo", true).order("nombre"),
  ]);

  return (
    <>
      <h1>Soporte</h1>
      <p className="muted">Incidencias de clientes o del equipo: algo que no funciona, un pedido de cambio, una duda de entrega.</p>
      <div className="row" style={{ margin: "12px 0" }}>
        <a href="/panel/soporte?ver=abiertos" className={`pill ${ver === "abiertos" ? "red" : ""}`}>Abiertos</a>
        <a href="/panel/soporte?ver=todos" className={`pill ${ver === "todos" ? "red" : ""}`}>Todos</a>
      </div>

      <div className="table-wrap"><table>
        <thead><tr><th>Fecha</th><th>Asunto</th><th>Prioridad</th><th>Creado por</th><th>Estado y responsable</th></tr></thead>
        <tbody>
          {(tickets ?? []).length === 0 && <tr><td colSpan={5} className="muted">Sin tickets.</td></tr>}
          {(tickets ?? []).map((t) => (
            <tr key={t.id}>
              <td>{fecha(t.created_at)}</td>
              <td><strong>{t.asunto}</strong>{t.descripcion && <div className="muted small">{t.descripcion}</div>}</td>
              <td><span className={`pill ${t.prioridad === "alta" ? "red" : t.prioridad === "media" ? "warn" : ""}`}>{t.prioridad}</span></td>
              <td>{nombreDe(t.creador as Rel)}</td>
              <td>
                <form action={actualizarTicket.bind(null, t.id)} className="inline">
                  <select name="estado" defaultValue={t.estado} aria-label="Estado">
                    <option value="abierto">Abierto</option><option value="en_progreso">En progreso</option><option value="cerrado">Cerrado</option>
                  </select>
                  <select name="asignado_a" defaultValue={t.asignado_a ?? ""} aria-label="Responsable">
                    <option value="">Sin responsable</option>
                    {(equipo ?? []).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                  <button type="submit" className="ghost">Guardar</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <h2>Nuevo ticket</h2>
      <ActionForm action={crearTicket} submit="Crear ticket">
        <label htmlFor="t-asunto">Asunto<input id="t-asunto" name="asunto" required /></label>
        <label htmlFor="t-desc">Descripción<textarea id="t-desc" name="descripcion" rows={3} /></label>
        <label htmlFor="t-prio">Prioridad
          <select id="t-prio" name="prioridad" defaultValue="media"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select>
        </label>
        <label htmlFor="t-asig">Responsable
          <select id="t-asig" name="asignado_a" defaultValue="">
            <option value="">Sin responsable</option>
            {(equipo ?? []).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </label>
      </ActionForm>
    </>
  );
}
