import { requireSeller, esGestor } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { DIAS } from "@/lib/format";
import { agregarBloque, borrarBloque } from "./actions";

type Props = { searchParams: Promise<{ seller?: string }> };

export default async function HorariosPage({ searchParams }: Props) {
  const { seller, supabase } = await requireSeller();
  const gestor = esGestor(seller);
  const { seller: elegido } = await searchParams;
  const sellerId = gestor && elegido ? elegido : seller.id;

  const [{ data: bloques }, equipo] = await Promise.all([
    supabase.from("horarios").select("id, dia_semana, hora_inicio, hora_fin").eq("seller_id", sellerId).order("dia_semana").order("hora_inicio"),
    gestor ? supabase.from("sellers").select("id, nombre").eq("activo", true).order("nombre") : Promise.resolve({ data: [] }),
  ]);

  return (
    <>
      <h1>Horarios</h1>
      <p className="muted">Las citas solo se pueden agendar dentro de estos bloques (hora de Colombia). En el embudo público solo aparecen horarios de closers que tengan bloques cargados aquí.</p>

      {gestor && (
        <form className="inline" style={{ margin: "14px 0" }}>
          <label htmlFor="seller">Ver horario de
            <select id="seller" name="seller" defaultValue={sellerId}>
              {(equipo.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </label>
          <button type="submit" className="ghost">Ver</button>
        </form>
      )}

      <div className="table-wrap"><table>
        <thead><tr><th>Día</th><th>Desde</th><th>Hasta</th><th></th></tr></thead>
        <tbody>
          {(bloques ?? []).length === 0 && <tr><td colSpan={4} className="muted">Sin bloques configurados.</td></tr>}
          {(bloques ?? []).map((b) => (
            <tr key={b.id}>
              <td>{DIAS[b.dia_semana]}</td><td>{b.hora_inicio.slice(0, 5)}</td><td>{b.hora_fin.slice(0, 5)}</td>
              <td><form action={borrarBloque.bind(null, b.id)}><button type="submit" className="ghost">Quitar</button></form></td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <h2>Agregar bloque</h2>
      <ActionForm action={agregarBloque} submit="Agregar" className="inline">
        <input type="hidden" name="seller_id" value={sellerId} />
        <label htmlFor="dia">Día
          <select id="dia" name="dia_semana" defaultValue={1}>
            {DIAS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </label>
        <label htmlFor="hi">Desde<input id="hi" name="hora_inicio" type="time" defaultValue="09:00" required /></label>
        <label htmlFor="hf">Hasta<input id="hf" name="hora_fin" type="time" defaultValue="18:00" required /></label>
      </ActionForm>
    </>
  );
}
