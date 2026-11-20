import { WORKSHOP } from "@/lib/workshop";

// Tarjeta "Únete a la comunidad" del área del alumno: Skool (clínica en vivo mensual, grabaciones) y grupo exclusivo.
// Las URL viven en src/lib/workshop.ts → WORKSHOP.comunidad (URL pendiente: mientras estén vacías, se avisa que llegan pronto).
export function Comunidad() {
  const c = WORKSHOP.comunidad;
  return (
    <aside className="alu-card alu-comunidad">
      <span className="alu-tag">Bonos</span>
      <h2>{c.titulo}</h2>
      <p className="muted">{c.texto}</p>
      <div className="alu-acciones">
        {c.skoolUrl
          ? <a href={c.skoolUrl} target="_blank" rel="noopener noreferrer" className="btn">{c.cta}</a>
          : <span className="pill">El enlace de la comunidad llega muy pronto</span>}
        {c.grupoUrl && <a href={c.grupoUrl} target="_blank" rel="noopener noreferrer" className="btn alu-btn-sec">Grupo exclusivo</a>}
      </div>
    </aside>
  );
}
