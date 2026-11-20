import Link from "next/link";
import type { Metadata } from "next";
import { VslVideo } from "@/components/vsl-video";
import { Sistema } from "@/components/landing/sistema";
import { Tilt } from "@/components/landing/tilt";
import { Historia } from "@/components/landing/historia";
import { TitularDolor } from "@/components/landing/titular-dolor";
import { StickyCta } from "@/components/landing/sticky-cta";
import { AplicarModal } from "@/components/landing/aplicar-modal";
import { SalidaAviso } from "@/components/landing/salida-aviso";
import { Clientes, type Cliente } from "@/components/landing/clientes";
import { Ondas } from "@/components/landing/ondas";

const DESCRIPCION = "Implementamos tu sistema de captación con IA: landing, embudo, panel, videos y campañas, conectados y a tu medida. Abrimos pocas plazas al mes.";
export const metadata: Metadata = {
  title: "Conexión — Sistemas de captación con IA para marcas boutique",
  description: DESCRIPCION,
  openGraph: { title: "Conexión — Tu sistema de captación con IA", description: DESCRIPCION, url: "https://conexionteam.app", siteName: "Conexión", locale: "es_CO", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Conexión — sistemas de captación con IA" }] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

type Props = { searchParams: Promise<{ utm_source?: string; utm_campaign?: string; utm_medium?: string; utm_content?: string }> };

// Estructura de la "página corta" (la misma lógica del embudo VSL de Sinergéticos), con marca y copy de Conexión:
// dolor → video → CTA · cambios antes/después · qué incluye · quién está detrás · objeciones · cierre · CTA fija.

// Personas y marcas con las que ha trabajado Fernanda (dato dado por ella, 19-nov-2026).
// Fotos de clientes (public/trayectoria/). Solo fotos reales enviadas por Fernanda, con permiso.
// Mientras la lista esté vacía, la sección de fotos no se muestra.
const CLIENTES: Cliente[] = [];

const TRAYECTORIA = [
  "Juan Ads", "María Elena Badillo", "Marco Lesama", "Jorge Serratos", "Manuel de León",
  "Dra. Diana y Dr. Camilo", "Elizabeth García Duque", "Adriana Vargas", "Empresas en España", "Marcas en todo el mundo",
];

const CAMBIOS = [
  ["Piezas sueltas: una página por aquí, un video por allá", "Un sistema conectado de punta a punta"],
  ["Los leads se pierden en el WhatsApp", "Cada lead con dueño, cita y seguimiento en tu panel"],
  ["Pagas anuncios a ciegas", "Sabes qué anuncio te trae cada venta"],
  ["Agendas a mano y la gente no llega", "Agenda automática con recordatorios por correo y WhatsApp"],
  ["Contenido bonito sin estrategia", "Videos con tu voz que explican y venden tu oferta"],
  ["Todo depende de ti", "Un proceso claro que tu equipo puede seguir"],
];

const OBJECIONES = [
  ["¿Necesito tener un equipo de ventas?", "No. Si estás sola o solo, el sistema te ordena las citas y te avisa. Si tienes equipo, el panel reparte los leads y muestra cómo va cada persona."],
  ["Ya tengo página web, ¿empiezo de cero?", "No necesariamente. En la llamada revisamos lo que tienes y te decimos qué se puede aprovechar y qué conviene rehacer."],
  ["¿Trabajan solo en Colombia?", "No. Trabajamos de forma remota con marcas en Latinoamérica, España y otros países."],
  ["¿Cuánto cuesta?", "Depende de las piezas que necesites y del punto en que está tu marca. Te damos una propuesta clara después de la llamada, sin compromiso."],
  ["¿Por qué solo abren pocas plazas?", "Porque somos boutique: trabajamos con pocos clientes a la vez para estar de verdad en cada proyecto, con atención directa."],
  ["¿Qué pasa en la llamada?", "Son 45 minutos para entender tu negocio. Si somos para ti, te decimos qué haríamos; si no, también te lo decimos."],
];

export default async function VslPage({ searchParams }: Props) {
  const utm = await searchParams;
  const qs = new URLSearchParams(Object.entries(utm).filter(([, v]) => v) as [string, string][]).toString();
  const aplicar = `/aplicar${qs ? `?${qs}` : ""}`;

  return (
    <div className="lp">
      <header className="lp-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" className="lp-top-logo" />
        <Link href={aplicar} className="btn lp-top-cta" data-evento="cta_aplicar">¿Soy apto?</Link>
      </header>

      {/* 1. Dolor → promesa → video → CTA */}
      <section className="lp-hero">
        <Ondas />
        <p className="eyebrow">Agencia boutique · pocas plazas al mes</p>
        <TitularDolor />
        <h1 className="lp-h1">Implementamos tu sistema de captación con <span className="rojo">IA</span>.</h1>
        <p className="lp-lead">Landing, embudo, panel, videos y campañas, conectados y hechos a la medida de tu marca.</p>
        <div className="vsl-frame lp-video"><VslVideo /></div>
        <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si soy apto</Link>
        <p className="muted small">5 preguntas de un toque · si eres apto, agendas un diagnóstico gratuito de 45 min.</p>
      </section>

      {/* 2. Cambios: antes → después */}
      <section className="lp-sec">
        <p className="eyebrow">Lo que cambia</p>
        <h2 className="lp-h2">De piezas sueltas a un sistema que vende</h2>
        <ul className="cambios">
          {CAMBIOS.map(([antes, despues]) => (
            <li key={antes}>
              <Tilt className="cambio">
                <span className="cambio-antes">{antes}</span>
                <span className="cambio-flecha" aria-hidden="true">↓</span>
                <span className="cambio-despues">{despues}</span>
              </Tilt>
            </li>
          ))}
        </ul>
        <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si soy apto</Link>
      </section>

      {/* 3. Qué incluye: el sistema */}
      <section className="lp-sec" id="sistema">
        <p className="eyebrow">Qué implementamos</p>
        <h2 className="lp-h2">Cinco piezas que trabajan juntas</h2>
        <p className="lp-sub">No vendemos piezas sueltas. Construimos el camino completo que lleva a una persona desde el anuncio hasta la venta, y lo dejamos funcionando con tu equipo.</p>
        <Sistema />
      </section>

      {/* 4. Quién está detrás: historia + trayectoria */}
      <section className="lp-sec lp-historia" id="historia">
        <p className="eyebrow">Soy Fer · la Sabia Creativa</p>
        <h2 className="lp-h2">Esta no es la historia de una agencia. Es la mía.</h2>
        <p className="lp-sub">Desliza las escenas. Cada caída me enseñó algo que hoy uso en tu marca.</p>
        <Historia />
      </section>

      <section className="lp-sec lp-tray">
        <p className="eyebrow">Trayectoria</p>
        <h2 className="lp-h2">He estado detrás de marcas que venden</h2>
        <p className="lp-sub">Creadores, expertos, médicos y empresas en Latinoamérica, España y otros países. Esto es parte de ese camino:</p>
        <Clientes clientes={CLIENTES} />
        <div className="marquee" aria-label="Personas y marcas con las que he trabajado">
          {[0, 1].map((fila) => (
            <div key={fila} className={`marquee-fila${fila ? " inversa" : ""}`} aria-hidden={fila === 1}>
              {[...TRAYECTORIA, ...TRAYECTORIA].map((n, i) => (
                <span key={i} className="marquee-item" aria-hidden={i >= TRAYECTORIA.length || fila === 1}>{n}<i aria-hidden="true">●</i></span>
              ))}
            </div>
          ))}
        </div>
        <ul className="sr-only">{TRAYECTORIA.map((n) => <li key={n}>{n}</li>)}</ul>
        <div className="lp-regiones">{["Latinoamérica", "España", "El mundo"].map((r) => <span key={r} className="pill">{r}</span>)}</div>
      </section>

      {/* Testimonios en video */}
      <section className="lp-sec" id="testimonios">
        <p className="eyebrow">Testimonios</p>
        <h2 className="lp-h2">Escúchalo en video</h2>
        <div className="testimonios">
          <figure className="testimonio">
            <video controls preload="metadata" playsInline poster="/vsl-poster.jpg"><source src="/vsl.mp4" type="video/mp4" /></video>
            <figcaption>¿Negocio estancado? · 1 min</figcaption>
          </figure>
        </div>
      </section>

      {/* 5. Objeciones */}
      <section className="lp-sec" id="preguntas">
        <p className="eyebrow">Preguntas</p>
        <h2 className="lp-h2">Lo que suelen preguntarnos</h2>
        <div className="faq">
          {OBJECIONES.map(([q, a]) => (
            <details key={q} className="faq-item">
              <summary>{q}<span aria-hidden="true" className="faq-mas" /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 6. Cierre: plazas boutique + pasos */}
      <section className="lp-sec" id="aplicar">
        <Tilt className="lp-boutique">
          <div className="lp-boutique-in">
            <p className="eyebrow">Boutique de verdad</p>
            <h2 className="lp-h2">Abrimos pocas plazas cada mes</h2>
            <ol className="cierre-pasos">
              <li><b>1</b>Respondes 5 preguntas de un toque</li>
              <li><b>2</b>Hablamos 45 minutos sobre tu caso</li>
              <li><b>3</b>Implementamos tu sistema</li>
            </ol>
            <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si soy apto</Link>
            <p className="cierre-nota">Si no somos para ti, te lo decimos en la llamada.</p>
          </div>
        </Tilt>
      </section>

      <footer className="lp-foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" />
        <span>Conexión · Agencia boutique · Medellín · conexionteam.app</span>
        <nav className="lp-legal" aria-label="Legal"><Link href="/cotizar">Cotizar</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></nav>
        <p className="lp-descargo">Cada negocio es distinto: no prometemos ingresos ni resultados específicos. Este sitio no forma parte de Meta ni está respaldado por Meta.</p>
      </footer>

      <StickyCta href={aplicar} />
      <AplicarModal />
      <SalidaAviso href={aplicar} />
    </div>
  );
}
