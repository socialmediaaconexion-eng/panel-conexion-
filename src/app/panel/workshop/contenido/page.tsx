import Link from "next/link";
import { requireGestor } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { WORKSHOP } from "@/lib/workshop";
import { fuenteVideo, recursosATexto, recursosDe } from "@/lib/video";
import { Confirmar } from "../ui";
import { borrarLeccion, borrarModulo, crearCurso, crearLeccion, crearModulo, guardarCurso, guardarLeccion, guardarModulo } from "../actions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ curso?: string }> };
type Leccion = { id: string; orden: number; titulo: string; descripcion: string | null; video_url: string | null; prompt: string | null; duracion_min: number | null; recursos: unknown; vista_previa: boolean };
type Modulo = { id: string; orden: number; titulo: string; descripcion: string | null; letra: string | null; entregable: string | null; numerado: boolean; lecciones: Leccion[] };

const TIPO_VIDEO: Record<string, string> = { youtube: "YouTube", vimeo: "Vimeo", archivo: "Archivo directo", ninguno: "Sin video" };

function CamposModulo({ m }: { m?: Modulo }) {
  return (
    <div className="grid">
      <label>Título<input name="titulo" defaultValue={m?.titulo} required /></label>
      <label>Orden<input name="orden" type="number" defaultValue={m?.orden ?? 1} /></label>
      <label>Letra A·L·M·A (opcional)<input name="letra" maxLength={2} defaultValue={m?.letra ?? ""} /></label>
      <label>Descripción<textarea name="descripcion" rows={2} defaultValue={m?.descripcion ?? ""} /></label>
      <label>Entregable<textarea name="entregable" rows={2} defaultValue={m?.entregable ?? ""} /></label>
      <label className="ws-check"><input type="checkbox" name="numerado" defaultChecked={m?.numerado ?? true} /> Cuenta como módulo numerado (no para Bienvenida/Cierre)</label>
    </div>
  );
}

function CamposLeccion({ l }: { l?: Leccion }) {
  return (
    <div className="grid">
      <label>Título<input name="titulo" defaultValue={l?.titulo} required /></label>
      <label>Orden<input name="orden" type="number" defaultValue={l?.orden ?? 1} /></label>
      <label>Duración (min)<input name="duracion_min" type="number" min={0} defaultValue={l?.duracion_min ?? ""} /></label>
      <label>Video (YouTube no listado, Vimeo o .mp4)<input name="video_url" type="url" defaultValue={l?.video_url ?? ""} placeholder="https://youtu.be/… · https://vimeo.com/123/abc · https://…/video.mp4" /></label>
      <label>Descripción<textarea name="descripcion" rows={3} defaultValue={l?.descripcion ?? ""} /></label>
      <label>Prompt para copiar<textarea name="prompt" rows={3} defaultValue={l?.prompt ?? ""} /></label>
      <label>Recursos (uno por línea: Nombre | https://…)<textarea name="recursos" rows={3} defaultValue={recursosATexto(recursosDe(l?.recursos))} placeholder="Plantilla Ficha ALMA | https://…" /></label>
      <label className="ws-check"><input type="checkbox" name="vista_previa" defaultChecked={l?.vista_previa ?? false} /> Vista previa gratuita</label>
    </div>
  );
}

// Gestión de contenido: curso (título, precios, meses de acceso), módulos y lecciones.
export default async function ContenidoWorkshop({ searchParams }: Props) {
  const { supabase } = await requireGestor();
  const { curso: cursoSel } = await searchParams;
  const { data: cursos } = await supabase.from("cursos").select("*").order("created_at");
  const curso = (cursos ?? []).find((c) => c.id === cursoSel) ?? (cursos ?? []).find((c) => c.slug === WORKSHOP.slug) ?? cursos?.[0];
  const { data: modsData } = curso
    ? await supabase.from("modulos").select("id, orden, titulo, descripcion, letra, entregable, numerado, lecciones(id, orden, titulo, descripcion, video_url, prompt, duracion_min, recursos, vista_previa)").eq("curso_id", curso.id).order("orden")
    : { data: [] };
  const modulos = ((modsData ?? []) as Modulo[]).map((m) => ({ ...m, lecciones: [...m.lecciones].sort((a, b) => a.orden - b.orden) }));
  const total = modulos.reduce((t, m) => t + m.lecciones.length, 0);
  const minutos = modulos.reduce((t, m) => t + m.lecciones.reduce((s, l) => s + (l.duracion_min ?? 0), 0), 0);
  const sinVideo = modulos.reduce((t, m) => t + m.lecciones.filter((l) => !l.video_url).length, 0);

  return (
    <>
      {(cursos ?? []).length > 1 && (
        <div className="row" style={{ margin: "10px 0" }}>
          {(cursos ?? []).map((c) => <Link key={c.id} href={`/panel/workshop/contenido?curso=${c.id}`} className={`pill ${c.id === curso?.id ? "red" : ""}`}>{c.titulo}</Link>)}
        </div>
      )}

      {!curso && <div className="alert error">No hay cursos. Corre la migración 0009 o crea uno abajo.</div>}

      {curso && (
        <>
          <h2>Curso</h2>
          <p className="muted small" style={{ marginTop: -4 }}>{total} lecciones · {minutos} min · {sinVideo} sin video · se ve en <Link href={`/curso/${curso.slug}`}>/curso/{curso.slug}</Link>{curso.slug === WORKSHOP.slug && <> y se vende en <Link href="/workshop">/workshop</Link></>}</p>
          <div className="card">
            <ActionForm action={guardarCurso.bind(null, curso.id)} submit="Guardar curso" className="cobro-form">
              <div className="grid">
                <label>Título<input name="titulo" defaultValue={curso.titulo} required /></label>
                <label>Precio COP (Colombia, IVA incluido)<input name="precio_cop" type="number" min={0} defaultValue={curso.precio_cop ?? ""} /></label>
                <label>Precio USD (otros países)<input name="precio_usd" type="number" min={0} step="0.01" defaultValue={curso.precio_usd ?? ""} /></label>
                <label>Meses de acceso (vacío = sin vencimiento)<input name="meses_acceso" type="number" min={1} defaultValue={curso.meses_acceso ?? ""} /></label>
                <label>Descripción<textarea name="descripcion" rows={2} defaultValue={curso.descripcion ?? ""} /></label>
                <label className="ws-check"><input type="checkbox" name="activo" defaultChecked={curso.activo} /> Activo (visible y a la venta)</label>
              </div>
            </ActionForm>
          </div>

          <h2>Módulos y lecciones</h2>
          <div className="ws-contenido">
            {modulos.map((m) => (
              <div key={m.id} className="card ws-mod">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{m.orden}. {m.titulo}{m.letra ? ` · ${m.letra}` : ""}</strong>
                  <Confirmar action={borrarModulo.bind(null, m.id)} texto="Borrar módulo" pregunta={`¿Borrar «${m.titulo}» y sus ${m.lecciones.length} lecciones? El progreso de los alumnos en esas lecciones también se borra.`} />
                </div>
                <details><summary className="small">Editar módulo</summary>
                  <ActionForm action={guardarModulo.bind(null, m.id)} submit="Guardar módulo" className="cobro-form"><CamposModulo m={m} /></ActionForm>
                </details>
                <ul className="ws-lecs">
                  {m.lecciones.map((l) => (
                    <li key={l.id}>
                      <details>
                        <summary>
                          <span>{l.orden}. {l.titulo}</span>
                          <span className="muted small">{l.duracion_min ? `${l.duracion_min} min · ` : ""}{TIPO_VIDEO[fuenteVideo(l.video_url).tipo]}{l.vista_previa ? " · vista previa" : ""}{recursosDe(l.recursos).length ? ` · ${recursosDe(l.recursos).length} recursos` : ""}</span>
                        </summary>
                        <ActionForm action={guardarLeccion.bind(null, l.id)} submit="Guardar lección" className="cobro-form"><CamposLeccion l={l} /></ActionForm>
                        <Confirmar action={borrarLeccion.bind(null, l.id)} texto="Borrar lección" pregunta={`¿Borrar la lección «${l.titulo}»?`} />
                      </details>
                    </li>
                  ))}
                </ul>
                <details><summary className="small">+ Nueva lección</summary>
                  <ActionForm action={crearLeccion.bind(null, m.id)} submit="Crear lección" className="cobro-form"><CamposLeccion /></ActionForm>
                </details>
              </div>
            ))}
            <details className="card"><summary><strong>+ Nuevo módulo</strong></summary>
              <ActionForm action={crearModulo.bind(null, curso.id)} submit="Crear módulo" className="cobro-form"><CamposModulo /></ActionForm>
            </details>
          </div>
        </>
      )}

      <h2>Nuevo curso</h2>
      <div className="card">
        <ActionForm action={crearCurso} submit="Crear curso" className="inline">
          <label>Título<input name="titulo" required /></label>
          <label>Slug (URL)<input name="slug" required placeholder="mi-curso" /></label>
        </ActionForm>
      </div>
    </>
  );
}
