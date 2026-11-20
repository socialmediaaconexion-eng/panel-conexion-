import Link from "next/link";
import { requireAlumno } from "@/lib/alumno";
import { cursoDelAlumno } from "@/lib/curso-alumno";
import { Comunidad } from "@/components/workshop/comunidad";
import { fecha } from "@/lib/format";

type Insc = { id: string; estado: string; cursos: { slug: string; titulo: string; descripcion: string | null } | { slug: string; titulo: string; descripcion: string | null }[] | null };

export default async function MisCursos() {
  const { alumno, supabase } = await requireAlumno();
  const { data } = await supabase.from("inscripciones").select("id, estado, cursos(slug, titulo, descripcion)").eq("alumno_id", alumno.id).order("created_at");
  const lista = ((data ?? []) as Insc[]).map((i) => ({ ...i, curso: Array.isArray(i.cursos) ? i.cursos[0] : i.cursos })).filter((i) => i.curso);
  const activas = await Promise.all(lista.filter((i) => i.estado === "activa").map(async (i) => ({ i, c: await cursoDelAlumno(supabase, alumno.id, i.curso!.slug) })));
  const pendientes = lista.filter((i) => i.estado === "pendiente_pago");

  return (
    <>
      <h1 className="alu-h1">Hola, {alumno.nombre.split(" ")[0]}</h1>
      <p className="muted" style={{ marginTop: 0 }}>Aquí están tus cursos. Retoma donde lo dejaste.</p>

      {activas.length === 0 && (
        <div className="alu-card alu-vacio">
          <strong>Todavía no tienes cursos activos</strong>
          <p className="muted">{pendientes.length ? "Estamos confirmando tu pago. Apenas se confirme, el curso aparece aquí." : "Cuando compres un curso, aparece aquí."}</p>
          {!pendientes.length && <Link href="/workshop" className="btn">Ver el taller</Link>}
        </div>
      )}

      <div className="alu-lista">
        {activas.map(({ i, c }) => {
          if (!c) return null;
          const pct = c.total ? Math.round((c.hechas / c.total) * 100) : 0;
          return (
            <article key={i.id} className="alu-card alu-curso">
              <span className="alu-tag">{c.hechas === c.total && c.total ? "Completado" : pct ? "En curso" : "Nuevo"}</span>
              <h2>{c.curso.titulo}</h2>
              {c.curso.descripcion && <p className="muted">{c.curso.descripcion}</p>}
              <div className="alu-progreso" aria-label={`Progreso: ${pct}%`}><span style={{ width: `${pct}%` }} /></div>
              <p className="muted small" style={{ margin: 0 }}>{c.hechas} de {c.total} lecciones vistas · {pct}%</p>
              {c.vencida
                ? <p className="alert error small" style={{ margin: 0 }}>Tu acceso venció el {fecha(c.venceAt!)}. Escríbenos si quieres renovarlo.</p>
                : c.venceAt && <p className="muted small" style={{ margin: 0 }}>Acceso hasta el {fecha(c.venceAt)}</p>}
              <div className="alu-acciones">
                {c.activa && c.siguiente && <Link href={`/curso/${c.curso.slug}/${c.siguiente.id}`} className="btn">{pct ? "Continuar" : "Empezar"}</Link>}
                <Link href={`/curso/${c.curso.slug}`} className="btn alu-btn-sec">Ver módulos</Link>
              </div>
            </article>
          );
        })}
      </div>

      {activas.some(({ c }) => c?.activa) && <Comunidad />}
    </>
  );
}
