import Link from "next/link";
import { requireSeller } from "@/lib/auth";
import { ETAPAS, ETAPA_LABEL, fecha } from "@/lib/format";
import { NuevoLeadForm } from "./nuevo-lead-form";

type Props = { searchParams: Promise<{ q?: string; etapa?: string }> };

export default async function LeadsPage({ searchParams }: Props) {
  const { supabase } = await requireSeller();
  const { q, etapa } = await searchParams;

  let query = supabase
    .from("leads")
    .select("id, nombre, email, telefono, embudo, etapa, created_at, lead_assignments(activo, sellers!lead_assignments_seller_id_fkey(nombre))")
    .order("created_at", { ascending: false })
    .limit(200);
  if (q) query = query.or(`nombre.ilike.%${q.replace(/[%,]/g, "")}%,email.ilike.%${q.replace(/[%,]/g, "")}%`);
  if (etapa && ETAPAS.includes(etapa as (typeof ETAPAS)[number])) query = query.eq("etapa", etapa);
  const { data: leads } = await query;

  const dueno = (l: NonNullable<typeof leads>[number]) => {
    const activa = (l.lead_assignments as { activo: boolean; sellers: { nombre: string } | { nombre: string }[] | null }[] | null)?.find((a) => a.activo);
    const s = activa?.sellers;
    return (Array.isArray(s) ? s[0]?.nombre : s?.nombre) ?? "Sin dueño";
  };

  return (
    <>
      <h1>Leads</h1>
      <p className="muted">Cada persona que entra por un embudo o que agregas a mano.</p>

      <form className="inline" style={{ margin: "16px 0" }}>
        <label htmlFor="q">Buscar<input id="q" name="q" defaultValue={q} placeholder="Nombre o correo" /></label>
        <label htmlFor="etapa">Etapa
          <select id="etapa" name="etapa" defaultValue={etapa ?? ""}>
            <option value="">Todas</option>
            {ETAPAS.map((e) => <option key={e} value={e}>{ETAPA_LABEL[e]}</option>)}
          </select>
        </label>
        <button type="submit" className="ghost">Filtrar</button>
      </form>

      <div className="table-wrap"><table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Embudo</th><th>Etapa</th><th>Dueño</th><th>Entró</th></tr></thead>
        <tbody>
          {(leads ?? []).length === 0 && <tr><td colSpan={6} className="muted">No hay leads con esos filtros.</td></tr>}
          {(leads ?? []).map((l) => (
            <tr key={l.id}>
              <td><Link href={`/panel/leads/${l.id}`}>{l.nombre}</Link></td>
              <td>{l.email}</td>
              <td>{l.embudo}</td>
              <td><span className="pill">{ETAPA_LABEL[l.etapa]}</span></td>
              <td>{dueno(l)}</td>
              <td>{fecha(l.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <h2>Agregar lead a mano</h2>
      <NuevoLeadForm />
    </>
  );
}
