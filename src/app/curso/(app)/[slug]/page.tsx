import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAlumno } from "@/lib/alumno";
import { cursoDelAlumno } from "@/lib/curso-alumno";
import { fecha } from "@/lib/format";
import { SiguientePaso } from "@/components/workshop/siguiente-paso";
import { Comunidad } from "@/components/workshop/comunidad";

type Props = { params: Promise<{ slug: string }> };

export default async function CursoPage({ params }: Props) {
  const { slug } = await params;
  const { alumno, supabase } = await requireAlumno();
  const c = await cursoDelAlumno(supabase, alumno.id, slug);
  if (!c) notFound();
  const pct = c.total ? Math.round((c.hechas / c.total) * 100) : 0;
  let n = 0;

  return (
    <>
      <Link href="/curso" className="alu-volver">← Mis cursos</Link>
      <h1 className="alu-h1">{c.curso.titulo}</h1>
      {c.activa ? (
        <>
          <div className="alu-progreso" aria-label={`Progreso: ${pct}%`}><span style={{ width: `${pct}%` }} /></div>
          <p className="muted small">{c.hechas} de {c.total} lecciones vistas · {pct}%{c.venceAt ? ` · acceso hasta el ${fecha(c.venceAt)}` : ""}</p>
          {c.siguiente && <Link href={`/curso/${slug}/${c.siguiente.id}`} className="btn alu-btn-full">{c.hechas ? "Continuar donde lo dejé" : "Empezar el curso"}</Link>}
        </>
      ) : (
        <div className="alu-card alu-vacio">
          <strong>{c.vencida ? "Tu acceso a este curso venció" : "Este curso no está activo en tu cuenta"}</strong>
          <p className="muted">{c.vencida ? "Escríbenos si quieres renovarlo. Mientras tanto puedes ver las lecciones de vista previa." : "Puedes ver las lecciones de vista previa. Para ver todo, compra el curso."}</p>
          {!c.vencida && <Link href="/workshop" className="btn">Ver el taller</Link>}
        </div>
      )}

      <ol className="alu-modulos">
        {c.modulos.map((m) => (
          <li key={m.id} className="alu-card">
            <div className="alu-mod-cab">
              <span className={`ws-num${m.letra ? " con-letra" : ""}`}>{m.letra ?? (m.numerado ? ++n : "·")}</span>
              <div>
                <strong>{m.titulo}</strong>
                {m.descripcion && <p className="muted small" style={{ margin: 0 }}>{m.descripcion}</p>}
              </div>
            </div>
            <ul className="alu-lecciones">
              {m.lecciones.map((l) => (
                <li key={l.id}>
                  {l.bloqueada ? (
                    <span className="alu-lec bloqueada"><span className="alu-ico" aria-hidden="true">🔒</span><span>{l.titulo}</span></span>
                  ) : (
                    <Link href={`/curso/${slug}/${l.id}`} className={`alu-lec${l.vista ? " vista" : ""}`}>
                      <span className="alu-ico" aria-hidden="true">{l.vista ? "✓" : "▶"}</span>
                      <span>{l.titulo}{!c.activa && l.vista_previa && <span className="pill ws-gratis">Vista previa</span>}</span>
                      {l.duracion_min ? <span className="muted small">{l.duracion_min} min</span> : null}
                    </Link>
                  )}
                </li>
              ))}
              {m.lecciones.length === 0 && <li className="muted small">Lecciones muy pronto.</li>}
            </ul>
            {m.entregable && <p className="alu-entregable"><strong>Terminas con:</strong> {m.entregable}</p>}
          </li>
        ))}
      </ol>

      {c.activa && <Comunidad />}
      {c.activa && <SiguientePaso />}
    </>
  );
}
