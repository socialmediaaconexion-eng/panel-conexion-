import Link from "next/link";
import type { Metadata } from "next";
import { VslVideo } from "@/components/vsl-video";
import { Sistema } from "@/components/landing/sistema";
import { Tilt } from "@/components/landing/tilt";
import { LineaHistoria } from "@/components/landing/linea-historia";
import { TitularDolor } from "@/components/landing/titular-dolor";
import { StickyCta } from "@/components/landing/sticky-cta";
import { AplicarModal } from "@/components/landing/aplicar-modal";
import { SalidaAviso } from "@/components/landing/salida-aviso";
import { TelVentas } from "@/components/landing/tel-ventas";
import { Clientes, type Cliente } from "@/components/landing/clientes";
import { Ondas } from "@/components/landing/ondas";
import { CambiosToggle } from "@/components/landing/cambios-toggle";

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
const CLIENTES: Cliente[] = [
  { nombre: "Juan Ads", foto: "/trayectoria/juan-ads.jpg" },
  { nombre: "María Elena Badillo", foto: "/trayectoria/maria-elena-badillo.jpg" },
  { nombre: "Jorge Serratos", foto: "/trayectoria/jorge-serratos.jpg" },
  { nombre: "Marco Lezama", foto: "/trayectoria/marco-lezama.jpg" },
  { nombre: "Manuel de León", foto: "/trayectoria/manuel-de-leon.jpg" },
  { nombre: "Dra. Diana y Dr. Camilo", foto: "/trayectoria/dra-diana-dr-camilo.jpg" },
  { nombre: "Elizabet García Duque", foto: "/trayectoria/elizabet-garcia-duque.jpg" },
];

// Valores de Conexión (dados por Fernanda, 20-nov-2026).
const VALORES = ["Transparencia", "Resiliencia", "Comunicación", "Energía", "Sinergia", "Respeto", "Osadía"];

const TRAYECTORIA = [
  "Juan Ads", "María Elena Badillo", "Marco Lezama", "Jorge Serratos", "Manuel de León",
  "Dra. Diana y Dr. Camilo", "Elizabet García Duque", "Adriana Vargas", "Empresas en España", "Marcas en todo el mundo",
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
  ["¿Cuánto cuesta?", "Depende de tu negocio. Primero respondes 5 preguntas de un toque y te damos una respuesta inmediata; si podemos trabajar juntos, agendas tu diagnóstico y te enviamos la cotización a tu correo."],
  ["¿Qué es el panel?", "Un sistema interno diseñado a la medida de tu organización: estado del negocio, métricas de campañas, ventas del día, alertas, tu equipo y los KPI de cada área, en tu celular."],
  ["¿Por qué solo abren pocas plazas?", "Porque somos boutique: trabajamos con pocos clientes a la vez para estar de verdad en cada proyecto, con atención directa y respeto por tu tiempo."],
  ["¿Qué pasa en la llamada?", "Son 30 minutos para entender tu negocio, con total transparencia: si somos para ti, te decimos qué haríamos; si no, también te lo decimos."],
];

export default async function VslPage({ searchParams }: Props) {
  const utm = await searchParams;
  const qs = new URLSearchParams(Object.entries(utm).filter(([, v]) => v) as [string, string][]).toString();
  const aplicar = `/aplicar${qs ? `?${qs}` : ""}`;

  return (
    <div className="lp">
      <header className="lp-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" className="lp-top-logo" />
        <Link href={aplicar} className="btn lp-top-cta" data-evento="cta_aplicar">¿Es para mí?</Link>
      </header>

      {/* 1. Dolor → promesa → video → CTA */}
      <section className="lp-hero">
        <Ondas />
        <p className="eyebrow">Equipo de expertos en IA · Colombia y México</p>
        <TitularDolor />
        <h1 className="lp-h1">Implementamos tu sistema de captación con <span className="rojo">IA</span>.</h1>
        <p className="lp-lead">Estrategia de marca, creatividad humana y la velocidad de la IA: landing, embudo, panel, videos y campañas, a la medida de tu negocio.</p>
        <div className="vsl-frame lp-video"><VslVideo src="/vsl-horizontal.mp4" poster="/vsl-horizontal-poster.jpg" /></div>
        <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
        <p className="muted small">5 preguntas de un toque · si es para ti, agendas un diagnóstico gratuito de 30 min.</p>
      </section>

      {/* 2. Cambios: antes → después */}
      <section className="lp-sec">
        <p className="eyebrow">Lo que cambia</p>
        <h2 className="lp-h2">De piezas sueltas a un sistema que vende</h2>
        <CambiosToggle />
        <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
      </section>

      {/* Filosofía: gestionar la IA, no delegarlo todo */}
      <section className="lp-sec">
        <p className="eyebrow">Nuestra forma de trabajar</p>
        <h2 className="lp-h2">Las cosas ya no son como antes</h2>
        <p className="lp-sub">No se trata de que la IA lo haga todo. Se trata de saber gestionarla y hacerla tu mejor aliada. Por eso no somos una agencia de marketing cualquiera: unimos en sinergia tres cosas que casi nunca van juntas.</p>
        <ul className="pilares">
          <li><Tilt className="pilar"><span className="pilar-n">01</span><h3>Estrategia de marca y comunicación</h3><p>Antes de diseñar, entendemos tu negocio, tu estructura y lo que tu marca necesita comunicar.</p></Tilt></li>
          <li><Tilt className="pilar"><span className="pilar-n">02</span><h3>Creatividad humana</h3><p>Ideas osadas, historias y criterio que una máquina no tiene. La IA ejecuta; las decisiones son nuestras y tuyas.</p></Tilt></li>
          <li><Tilt className="pilar pilar-rojo"><span className="pilar-n">03</span><h3>Ejecución rápida con IA</h3><p>Lo que antes tomaba meses hoy queda listo en semanas, con la misma calidad y toda la energía del equipo.</p></Tilt></li>
        </ul>
        <div className="lema">
          <p className="lema-frase">Si lo puedes imaginar, <span className="texto-acento">lo podemos crear.</span></p>
          <p className="lema-sub">Creadores para crear</p>
          <ul className="valores" aria-label="Nuestros valores">
            {VALORES.map((v) => <li key={v}>{v}</li>)}
          </ul>
        </div>
      </section>

      {/* Panel a la medida */}
      <section className="lp-sec" id="panel">
        <p className="eyebrow">Tu negocio en tu celular</p>
        <h2 className="lp-h2">Un panel que te dice cómo está todo tu negocio</h2>
        <div className="panel-demo">
          <div className="telefono" aria-hidden="true">
            <div className="tel-pantalla">
              <div className="tel-top"><img src="/logo-3d.png" alt="" /><span>Hoy</span></div>
              <TelVentas />
              <div className="tel-alerta"><i />Alerta: una campaña subió su costo por lead. Revísala hoy.</div>
              <div className="tel-barras">{[40, 62, 48, 75, 58, 88, 70].map((v, i) => <span key={i} style={{ height: v + "%" }} />)}</div>
              <div className="tel-lista"><span>Equipo de ventas</span><span>Marketing</span><span>Atención</span></div>
            </div>
          </div>
          <ul className="panel-lista">
            <li><b>Métricas de tus campañas</b> en tiempo real, desde el celular.</li>
            <li><b>Tus ventas día a día</b> y lo que falta por cobrar.</li>
            <li><b>Alertas</b> que te dicen exactamente qué está pasando y a qué ponerle atención.</li>
            <li><b>Contacto con tu equipo</b> y la agenda de cada persona.</li>
            <li><b>KPI por departamento</b>, si manejas un equipo de varias áreas.</li>
            <li><b>Revisión de tus páginas y landing pages</b>: cómo están hechas y qué mejorar.</li>
            <li><b>Diseñado a la medida de tu organización</b>.</li>
          </ul>
        </div>
        <p className="muted small">Ilustración del panel: cada uno se diseña con los datos y áreas de tu negocio.</p>
      </section>

      {/* 3. Qué incluye: el sistema */}
      <section className="lp-sec" id="sistema">
        <p className="eyebrow">Qué implementamos</p>
        <h2 className="lp-h2">Cinco piezas que trabajan juntas</h2>
        <p className="lp-sub">No vendemos piezas sueltas y no empezamos por los anuncios. Primero el guion y los videos; después la landing y las campañas; todo medido en tu panel.</p>
        <Sistema />
      </section>

      {/* 4. Quién está detrás: historia + trayectoria */}
      <section className="lp-sec lp-historia" id="historia">
        <p className="eyebrow">Mi historia · Fer</p>
        <h2 className="lp-h2">No vendo lo que leí. Vendo lo que construí.</h2>
        <p className="lp-sub">Detrás de cada embudo de Conexión hay años en sets, lanzamientos, madrugadas de código y una caída de la que aprendí a levantarme.</p>
        <LineaHistoria />
        <div className="lh-cierre">
          <p>No te voy a enseñar teoría. <strong>Te voy a instalar lo que ya me funcionó.</strong></p>
          <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
        </div>
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
        <h2 className="lp-h2">Lo que dicen quienes ya trabajaron con nosotros</h2>
        <div className="testimonios">
          <figure className="testimonio testimonio-h">
            <video controls preload="metadata" playsInline poster="/testimonio-dr-camilo.jpg"><source src="/testimonio-dr-camilo.mp4" type="video/mp4" /></video>
            <figcaption><strong>Dr. Camilo</strong> · médico intensivista e influencer · «Un antes y un después para tu negocio»</figcaption>
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
              <li><b>2</b>Hablamos 30 minutos sobre tu caso</li>
              <li><b>3</b>Implementamos tu sistema</li>
            </ol>
            <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
            <p className="cierre-nota">Si no somos para ti, te lo decimos en la llamada.</p>
          </div>
        </Tilt>
      </section>

      <footer className="lp-foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" />
        <span>Conexión · Creadores para crear · Si lo puedes imaginar, lo podemos crear</span>
        <nav className="lp-legal" aria-label="Legal"><Link href="/cotizar">Cotizar</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></nav>
        <p className="lp-descargo">Cada negocio es distinto: no prometemos ingresos ni resultados específicos. Este sitio no forma parte de Meta ni está respaldado por Meta.</p>
      </footer>

      <StickyCta href={aplicar} />
      <AplicarModal />
      <SalidaAviso href={aplicar} />
    </div>
  );
}
