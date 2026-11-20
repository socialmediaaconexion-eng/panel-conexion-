import { requireGestor } from "@/lib/auth";
import { fecha } from "@/lib/format";
import { WORKSHOP } from "@/lib/workshop";
import { CredForm } from "../ui";
import { darAcceso } from "../actions";
import { AccionesInscripcion, ESTADO_INSC } from "../acciones";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };
type Insc = { id: string; estado: string; curso_id: string; vence_at: string | null; primer_acceso_at: string | null; origen: string };
type AlumnoFila = { id: string; nombre: string; email: string; whatsapp: string | null; user_id: string | null; created_at: string; inscripciones: Insc[] };
type Mod = { id: string; orden: number; letra: string | null; numerado: boolean; titulo: string; curso_id: string; lecciones: { id: string }[] };

// Alumnos: buscar, dar acceso manual con correo y contraseña, revocar, reenviar el acceso y ver el progreso por módulo.
export default async function AlumnosWorkshop({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  const { q = "" } = await searchParams;
  const busca = q.trim().replace(/[%,()]/g, " ").slice(0, 80);

  let consulta = supabase.from("alumnos")
    .select("id, nombre, email, whatsapp, user_id, created_at, inscripciones(id, estado, curso_id, vence_at, primer_acceso_at, origen)")
    .order("created_at", { ascending: false }).limit(200);
  if (busca) consulta = consulta.or(`nombre.ilike.%${busca}%,email.ilike.%${busca}%,whatsapp.ilike.%${busca}%`);

  const [{ data: alumnosData }, { data: cursos }, { data: modsData }] = await Promise.all([
    consulta,
    supabase.from("cursos").select("id, titulo, slug").order("created_at"),
    supabase.from("modulos").select("id, orden, letra, numerado, titulo, curso_id, lecciones(id)").order("orden"),
  ]);
  const alumnos = (alumnosData ?? []) as AlumnoFila[];
  const mods = (modsData ?? []) as Mod[];
  const { data: progreso } = alumnos.length
    ? await supabase.from("progreso_lecciones").select("alumno_id, leccion_id").in("alumno_id", alumnos.map((a) => a.id))
    : { data: [] as { alumno_id: string; leccion_id: string }[] };
  const vistas = new Map<string, Set<string>>();
  for (const p of progreso ?? []) {
    if (!vistas.has(p.alumno_id)) vistas.set(p.alumno_id, new Set());
    vistas.get(p.alumno_id)!.add(p.leccion_id);
  }
  const tituloCurso = new Map((cursos ?? []).map((c) => [c.id, c.titulo]));
  const cursoPorDefecto = (cursos ?? []).find((c) => c.slug === WORKSHOP.slug)?.id ?? cursos?.[0]?.id;

  return (
    <>
      <h2>Dar acceso manual</h2>
      <p className="muted small" style={{ marginTop: -4 }}>Para ventas por transferencia, cortesías o pruebas. Crea el usuario, deja la inscripción activa e intenta enviar el correo. Si dejas la contraseña vacía, se genera una.</p>
      <div className="card">
        <CredForm action={darAcceso} submit="Crear acceso" className="cobro-form">
          <div className="grid">
            <label>Nombre<input name="nombre" required /></label>
            <label>Correo<input name="email" type="email" required /></label>
            <label>WhatsApp<input name="whatsapp" type="tel" placeholder="+57 300 000 0000" /></label>
            <label>Contraseña (opcional)<input name="clave" type="text" minLength={8} autoComplete="off" placeholder="Vacía = se genera" /></label>
            <label>Curso
              <select name="curso_id" defaultValue={cursoPorDefecto} required>
                {(cursos ?? []).map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}
              </select>
            </label>
          </div>
        </CredForm>
      </div>

      <h2>Alumnos</h2>
      <form className="inline" style={{ marginBottom: 10 }}>
        <label style={{ flex: "1 1 240px" }}>Buscar<input name="q" defaultValue={q} placeholder="Nombre, correo o WhatsApp" /></label>
        <button type="submit" className="ghost">Buscar</button>
      </form>
      <div className="table-wrap"><table>
        <thead><tr><th>Alumno</th><th>Curso y estado</th><th>Progreso por módulo</th><th>Acciones</th></tr></thead>
        <tbody>
          {alumnos.length === 0 && <tr><td colSpan={4} className="muted">{busca ? "Nadie coincide con la búsqueda." : "Todavía no hay alumnos."}</td></tr>}
          {alumnos.flatMap((a) => {
            const ins = a.inscripciones?.length ? a.inscripciones : [null];
            return ins.map((i) => {
              const vencida = Boolean(i?.vence_at && new Date(i.vence_at).getTime() <= Date.now());
              const [label, pill] = i ? ESTADO_INSC[i.estado] ?? [i.estado, ""] : ["Sin inscripción", ""];
              const mios = i ? mods.filter((m) => m.curso_id === i.curso_id) : [];
              const v = vistas.get(a.id) ?? new Set<string>();
              const total = mios.reduce((t, m) => t + m.lecciones.length, 0);
              const hechas = mios.reduce((t, m) => t + m.lecciones.filter((l) => v.has(l.id)).length, 0);
              let n = 0;
              return (
                <tr key={`${a.id}-${i?.id ?? "x"}`}>
                  <td><strong>{a.nombre}</strong><div className="muted small">{a.email}</div>{a.whatsapp && <div className="muted small">{a.whatsapp}</div>}{!a.user_id && <div className="muted small">Sin usuario todavía</div>}</td>
                  <td>{i && <div className="small">{tituloCurso.get(i.curso_id)}</div>}<span className={`pill ${pill}`}>{vencida && i?.estado === "activa" ? "Vencida" : label}</span>
                    {i?.vence_at && <div className="muted small">Hasta {fecha(i.vence_at)}</div>}
                    {i && <div className="muted small">{i.primer_acceso_at ? `Entró el ${fecha(i.primer_acceso_at)}` : "Aún no entra"}</div>}
                  </td>
                  <td>
                    {total > 0 ? (
                      <>
                        <div className="ws-mini-barra"><span style={{ width: `${Math.round((hechas / total) * 100)}%` }} /></div>
                        <div className="small">{hechas}/{total} lecciones · {Math.round((hechas / total) * 100)}%</div>
                        <div className="ws-chips">
                          {mios.filter((m) => m.lecciones.length).map((m) => {
                            const h = m.lecciones.filter((l) => v.has(l.id)).length;
                            const et = m.numerado ? `M${++n}` : m.titulo.slice(0, 6);
                            return <span key={m.id} title={m.titulo} className={`pill ${h === m.lecciones.length ? "good" : h ? "warn" : ""}`}>{et} {h}/{m.lecciones.length}</span>;
                          })}
                        </div>
                      </>
                    ) : <span className="muted small">—</span>}
                  </td>
                  <td>{i && <AccionesInscripcion id={i.id} estado={i.estado} vencida={vencida} />}</td>
                </tr>
              );
            });
          })}
        </tbody>
      </table></div>
    </>
  );
}
