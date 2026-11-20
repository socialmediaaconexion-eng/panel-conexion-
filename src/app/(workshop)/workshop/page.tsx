import Link from "next/link";
import type { Metadata } from "next";
import { WORKSHOP, precioTexto, precioNumero } from "@/lib/workshop";
import { temarioPublico, leccionesTotales } from "@/lib/cursos";
import { VideoVenta } from "@/components/workshop/video-venta";
import { CtaFija } from "@/components/workshop/cta-fija";
import { VistaUnaVez } from "@/components/workshop/vista";

export const revalidate = 300; // el temario y el precio se leen de la base de datos; se refrescan cada 5 min

const DESCRIPCION = "Un taller corto y práctico para crear, con Claude, tu arquetipo de marca, tus agentes, tu primera landing y un panel para ver tus números desde el celular.";
export const metadata: Metadata = {
  title: `${WORKSHOP.marca} — Dale ALMA a tu negocio con IA`,
  description: DESCRIPCION,
  alternates: { canonical: "https://conexionteam.app/workshop" },
  openGraph: { title: `${WORKSHOP.marca} — Dale ALMA a tu negocio con IA`, description: DESCRIPCION, url: "https://conexionteam.app/workshop", siteName: "Conexión", locale: "es_CO", type: "website" },
};

// Estructura VSL, celular primero: hero con video → problema → solución A·L·M·A → lo que te llevas → módulos (BD)
// → quién te guía → para quién → precio con dos botones → FAQ → cierre · CTA fija. Sin testimonios, cupos ni urgencia.
export default async function WorkshopPage() {
  const t = await temarioPublico(WORKSHOP.slug);
  const modulos = (t?.modulos ?? []).filter((m) => m.numerado);
  const cop = precioTexto(t?.curso.precio_cop, "COP");
  const usd = precioTexto(t?.curso.precio_usd, "USD");
  const nLecciones = leccionesTotales(t?.modulos ?? []);
  const { clinicaMensual, comunidad, abonoImplementacion } = WORKSHOP.pendientes;
  const comprar = "/workshop/comprar";
  const precioCorto = [usd, cop].filter(Boolean).join(" / ");
  const H = () => <>{WORKSHOP.titular.antes} <span className="rojo">{WORKSHOP.titular.resaltado}</span> {WORKSHOP.titular.despues}</>;

  return (
    <div className="lp ws">
      <VistaUnaVez evento="workshop_vista" />
      <header className="lp-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" className="lp-top-logo" />
        <Link href={comprar} className="btn lp-top-cta" data-evento="workshop_cta">Entrar a ALMA</Link>
      </header>

      <section className="lp-hero">
        <p className="eyebrow">{WORKSHOP.eyebrow}</p>
        <h1 className="lp-h1"><H /></h1>
        <p className="lp-lead">{WORKSHOP.bajada}</p>
        <div className="vsl-frame lp-video">
          <VideoVenta {...WORKSHOP.video} />
        </div>
        <p className="muted small">{WORKSHOP.bajoVideo}</p>
        <Link href={comprar} className="btn btn-big" data-evento="workshop_cta">{WORKSHOP.cta}</Link>
        {precioCorto && <p className="muted small">{precioCorto}, pago único</p>}
      </section>

      <section className="lp-sec ws-problema">
        <h2 className="lp-h2">{WORKSHOP.problema.titulo}</h2>
        {WORKSHOP.problema.parrafos.map((p, i) => <p key={i} className={i === WORKSHOP.problema.parrafos.length - 1 ? "ws-remate" : "lp-sub"}>{p}</p>)}
      </section>

      <section className="lp-sec" id="aprenderas">
        <p className="eyebrow">{WORKSHOP.siglas}</p>
        <h2 className="lp-h2">{WORKSHOP.solucion.titulo}</h2>
        <ul className="ws-letras">
          {WORKSHOP.solucion.letras.map(([l, de, txt], i) => (
            <li key={i}><span className="ws-letra">{l}</span><div><strong>{l} {de}</strong><p>{txt}</p></div></li>
          ))}
        </ul>
        <p className="lp-sub">{WORKSHOP.solucion.cierre}</p>
      </section>

      <section className="lp-sec">
        <p className="eyebrow">Lo que te llevas</p>
        <h2 className="lp-h2">Al terminar, tienes esto construido</h2>
        <ul className="ws-checks">{WORKSHOP.teLlevas.map((x) => <li key={x}>{x}</li>)}</ul>
      </section>

      {modulos.length > 0 && (
        <section className="lp-sec" id="modulos">
          <p className="eyebrow">Módulos</p>
          <h2 className="lp-h2">{modulos.length} módulos en orden</h2>
          <ol className="ws-modulos">
            {modulos.map((m, i) => (
              <li key={m.id}>
                <span className={`ws-num${m.letra ? " con-letra" : ""}`}>{m.letra ?? i + 1}</span>
                <div>
                  <strong>{m.titulo}</strong>
                  {m.descripcion && <p>{m.descripcion}</p>}
                  {m.lecciones.length > 0 && <span className="muted small">{m.lecciones.length} {m.lecciones.length === 1 ? "lección" : "lecciones"}</span>}
                </div>
              </li>
            ))}
          </ol>
          <p className="lp-sub">{nLecciones} lecciones cortas. Cada módulo termina con algo tuyo construido.</p>
          <Link href={comprar} className="btn btn-big" data-evento="workshop_cta">{WORKSHOP.cta}</Link>
        </section>
      )}

      <section className="lp-sec">
        <p className="eyebrow">{WORKSHOP.guia.titulo}</p>
        <div className="ws-guia">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vsl-horizontal-poster.jpg" alt="Fernanda Conde" />
          <div><p>{WORKSHOP.guia.texto}</p><strong>{WORKSHOP.guia.firma}</strong></div>
        </div>
      </section>

      <section className="lp-sec" id="para-quien">
        <p className="eyebrow">¿Es para ti?</p>
        <h2 className="lp-h2">Para quién es y para quién no</h2>
        <div className="ws-quien">
          <div className="ws-si"><h3>Para quién es</h3><ul>{WORKSHOP.paraQuien.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div className="ws-no"><h3>Para quién no es</h3><ul>{WORKSHOP.noEsPara.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
      </section>

      <section className="lp-sec" id="bonos">
        <p className="eyebrow">Bonos</p>
        {/* COPY PROVISIONAL: título de la sección de bonos */}
        <h2 className="lp-h2">No lo haces sola ni solo</h2>
        <ul className="ws-aprende">
          {WORKSHOP.bonos.map(([h, p]) => <li key={h}><h3>{h}</h3><p>{p}</p></li>)}
        </ul>
      </section>

      <section className="lp-sec" id="precio">
        <p className="eyebrow">Precio</p>
        <div className="plan plan-main ws-precio">
          <span className="plan-tag">ALMA · pago único</span>
          <div className="ws-precios">
            {cop && <div><div className="plan-precio"><small>COP</small>{precioNumero(t?.curso.precio_cop)}</div><p className="plan-nota">Colombia · {WORKSHOP.notaCop}. PSE, Nequi o tarjeta.</p></div>}
            {usd && <div><div className="plan-precio"><small>USD</small>{precioNumero(t?.curso.precio_usd)}</div><p className="plan-nota">México y otros países · sin IVA. Con tarjeta.</p></div>}
          </div>
          <strong>Incluye:</strong>
          <ul>{WORKSHOP.incluye({ lecciones: nLecciones, meses: t?.curso.meses_acceso ?? null, clinica: clinicaMensual, comunidad }).map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="ws-garantia">{WORKSHOP.garantia}</p>
          <div className="ws-botones">
            {cop && <Link href={`${comprar}?moneda=COP`} className="btn btn-big" data-evento="workshop_cta">{WORKSHOP.botonCop}</Link>}
            {usd && <Link href={`${comprar}?moneda=USD`} className="btn btn-big ws-btn-usd" data-evento="workshop_cta">{WORKSHOP.botonUsd}</Link>}
          </div>
        </div>
      </section>

      <section className="lp-sec" id="preguntas">
        <p className="eyebrow">Preguntas frecuentes</p>
        <h2 className="lp-h2">Lo que más nos preguntan</h2>
        <div className="faq">
          {WORKSHOP.faq({ usd, clinica: clinicaMensual, abono: abonoImplementacion }).map(([q, a]) => (
            <details key={q} className="faq-item"><summary>{q}<span className="faq-mas" aria-hidden="true" /></summary><p>{a}</p></details>
          ))}
        </div>
      </section>

      <section className="lp-final">
        <h2 className="lp-h2">{WORKSHOP.cierre.titulo}</h2>
        <p className="lp-sub">{WORKSHOP.cierre.texto}</p>
        <Link href={comprar} className="btn btn-big" data-evento="workshop_cta">{WORKSHOP.cta}</Link>
        {precioCorto && <p className="muted small">{precioCorto}</p>}
        <p className="muted small">¿Ya compraste? <Link href="/curso/login">Entra a tu curso</Link></p>
      </section>

      <footer className="lp-foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="" />
        <span>© Conexión · {WORKSHOP.marca}</span>
        <p className="lp-descargo">{WORKSHOP.pie}</p>
        <div className="lp-legal"><Link href="/terminos">Términos</Link><Link href="/privacidad">Privacidad</Link></div>
      </footer>

      <CtaFija href={comprar} texto={precioCorto ? `${WORKSHOP.ctaFija} · ${usd ?? cop}` : WORKSHOP.ctaFija} boton="Entrar" />
    </div>
  );
}
