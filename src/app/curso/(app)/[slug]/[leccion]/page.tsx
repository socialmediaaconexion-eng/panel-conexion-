import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAlumno } from "@/lib/alumno";
import { cursoDelAlumno } from "@/lib/curso-alumno";
import { fuenteVideo, recursosDe } from "@/lib/video";
import { Reproductor } from "./reproductor";
import { CopiarPrompt } from "./copiar-prompt";
import { marcarLeccion } from "./actions";
import { SiguientePaso } from "@/components/workshop/siguiente-paso";

type Props = { params: Promise<{ slug: string; leccion: string }> };

export default async function LeccionPage({ params }: Props) {
  const { slug, leccion } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(leccion)) notFound();
  const { alumno, supabase } = await requireAlumno();
  const c = await cursoDelAlumno(supabase, alumno.id, slug);
  if (!c) notFound();
  const idx = c.plano.findIndex((l) => l.id === leccion);
  if (idx === -1) notFound();
  const actual = c.plano[idx];

  // El video y los recursos solo llegan si RLS lo permite (curso activo o vista previa).
  const { data: detalle } = await supabase.from("lecciones").select("id, titulo, descripcion, video_url, prompt, recursos").eq("id", leccion).maybeSingle();

  if (actual.bloqueada || !detalle) {
    return (
      <>
        <Link href={`/curso/${slug}`} className="alu-volver">← {c.curso.titulo}</Link>
        <div className="alu-card alu-vacio">
          <strong>🔒 {actual.titulo}</strong>
          <p className="muted">{c.vencida ? "Tu acceso a este curso venció. Escríbenos si quieres renovarlo." : "Esta lección es parte del curso completo."}</p>
          {!c.vencida && <Link href="/workshop" className="btn">Ver el taller</Link>}
        </div>
      </>
    );
  }

  const accesibles = c.plano.filter((l) => !l.bloqueada);
  const pos = accesibles.findIndex((l) => l.id === leccion);
  const anterior = pos > 0 ? accesibles[pos - 1] : null;
  const siguiente = pos < accesibles.length - 1 ? accesibles[pos + 1] : null;
  const recursos = recursosDe(detalle.recursos);
  const fuente = fuenteVideo(detalle.video_url);
  const marcar = marcarLeccion.bind(null, slug, leccion, !actual.vista);
  const alTerminar = fuente.tipo === "archivo" && !actual.vista ? marcarLeccion.bind(null, slug, leccion, true) : undefined;

  return (
    <>
      <Link href={`/curso/${slug}`} className="alu-volver">← {c.curso.titulo}</Link>
      <Reproductor fuente={fuente} titulo={detalle.titulo} alTerminar={alTerminar} />

      <div className="alu-leccion">
        <p className="eyebrow" style={{ margin: 0 }}>{actual.modulo} · Lección {idx + 1} de {c.plano.length}</p>
        <h1 className="alu-h1">{detalle.titulo}</h1>
        <form action={marcar}>
          <button type="submit" className={actual.vista ? "ghost alu-btn-full" : "alu-btn-full"}>{actual.vista ? "✓ Vista · desmarcar" : "Marcar como vista"}</button>
        </form>
        {detalle.descripcion && <p className="alu-desc">{detalle.descripcion}</p>}

        {detalle.prompt && <CopiarPrompt texto={detalle.prompt} />}

        {recursos.length > 0 && (
          <section className="alu-card">
            <strong>Recursos de esta lección</strong>
            <ul className="alu-recursos">
              {recursos.map((r) => (
                <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer" download>⬇ {r.nombre}</a></li>
              ))}
            </ul>
          </section>
        )}

        <nav className="alu-pasos" aria-label="Lecciones">
          {anterior ? <Link href={`/curso/${slug}/${anterior.id}`} className="btn alu-btn-sec">← Anterior</Link> : <span />}
          {siguiente ? <Link href={`/curso/${slug}/${siguiente.id}`} className="btn">Siguiente →</Link> : <Link href={`/curso/${slug}`} className="btn alu-btn-sec">Ver módulos</Link>}
        </nav>

        {!siguiente && c.activa && <SiguientePaso />}
      </div>
    </>
  );
}
