import Link from "next/link";
import type { Metadata } from "next";
import { Tilt } from "@/components/landing/tilt";
import { Entregables } from "@/components/landing/entregables";

// Página de venta (no enlazada desde la landing: se envía después de la calificación o en la cotización).
export const metadata: Metadata = {
  title: "Inversión — Conexión",
  description: "Implementación del Sistema de Captación Conexión y Dirección mensual.",
  robots: { index: false, follow: false },
};

const IMPLEMENTACION = [
  ["🧭", "Estrategia de marca y comunicación", "Diagnóstico, cliente ideal, mensaje y oferta."],
  ["✍️", "Guionización", "Guiones de tu VSL y de tus primeras piezas, con tu voz."],
  ["🧲", "Embudo completo", "Landing, preguntas de calificación, agenda automática y página de gracias."],
  ["📣", "Campañas", "Estructura, públicos, anuncios y configuración en Meta."],
  ["📈", "Analítica conectada", "Píxel, UTMs y el embudo medido paso a paso, de cada anuncio a cada venta."],
  ["📱", "Tu panel a la medida", "Leads, citas, ventas, alertas y tu equipo, en tu celular."],
  ["⚙️", "Configuración y automatizaciones", "Recordatorios por correo y WhatsApp, cobros y flujos de seguimiento."],
  ["🤝", "Seguimiento y entrega del servicio", "Acompañamiento durante el mes, capacitación a tu equipo y entrega funcionando."],
];

const MENSUAL = [
  "Comité mensual de captación con Fer",
  "8 guiones al mes",
  "Rodaje dirigido en remoto",
  "8 videos editados con motion y subtítulos",
  "Gestión y optimización de campañas",
  "Panel, analítica y alertas al día",
  "Parte semanal: 3 números y 1 decisión",
];

const NO_INCLUYE = ["La pauta (se paga directo a Meta)", "Manejo de comunidad y respuesta de mensajes", "Grabación presencial", "Módulos nuevos del panel fuera de lo acordado"];
const TU_PARTE = ["Grabar en las fechas que agendamos", "Tener a alguien que atienda los leads", "Revisar y aprobar en 48 horas"];

export default function PlanesPage() {
  return (
    <div className="lp planes">
      <header className="lp-top">
        <Link href="/vsl" aria-label="Conexión">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-3d.png" alt="Conexión" className="lp-top-logo" />
        </Link>
        <Link href="/aplicar" className="btn lp-top-cta" data-evento="cta_aplicar">¿Es para mí?</Link>
      </header>

      <section className="lp-hero pl-hero">
        <p className="eyebrow">Inversión</p>
        <h1 className="lp-h1">Tu sistema de captación, creado y dirigido por nosotros</h1>
        <p className="lp-lead">Estrategia de marca, creatividad humana y ejecución con IA. Pocas plazas al mes, atención directa.</p>
      </section>

      <Entregables />

      {/* Precio: mes 1 a USD 1.800; desde el mes 2, USD 1.500/mes con descuento por continuar (dato de Fernanda, 21-nov-2026). */}
      <section className="lp-sec pl-precios" id="inversion">
        <p className="eyebrow">Cómo se paga</p>
        <h2 className="lp-h2">Un mes para crearlo. Después, un precio con descuento si sigues con nosotros.</h2>
        <ol className="pl-linea" aria-label="Pagos mes a mes">
          <li><small>Mes 1</small><b>USD 1.800</b><span>Implementación</span></li>
          <li className="pl-linea-desc"><small>Mes 2</small><b>USD 1.500</b><span>Con descuento</span></li>
          <li className="pl-linea-desc"><small>Mes 3 en adelante</small><b>USD 1.500</b><span>Con descuento</span></li>
        </ol>
      </section>

      <section className="lp-sec pl-dos">
        {/* Implementación */}
        <Tilt className="pl-card pl-card-main">
          <span className="plan-tag">Mes 1 · Implementación</span>
          <h2>Sistema de Captación Conexión</h2>
          <div className="plan-precio"><small>USD</small>1.800</div>
          <p className="pl-nota-osc">Pago único · listo y funcionando en 30 días</p>
          <ul className="pl-items">
            {IMPLEMENTACION.map(([i, t, d]) => (
              <li key={t}><span className="pl-i" aria-hidden="true">{i}</span><span><strong>{t}</strong><small>{d}</small></span></li>
            ))}
          </ul>
          <a className="btn btn-big pl-pagar" href="/api/pagar?plan=impl">Pagar implementación</a>
        </Tilt>

        {/* Mensual */}
        <Tilt className="pl-card pl-mes">
          <span className="plan-tag">Desde el mes 2 · Si sigues con nosotros</span>
          <h2>Dirección de Captación</h2>
          <div className="plan-precio"><small>USD</small>1.500<span className="plan-mes">/mes</span></div>
          <p className="pl-desc"><b>Precio con descuento</b> para quienes siguen con nosotros el mes siguiente. El primer mes es de USD 1.800; desde el segundo pagas USD 1.500 al mes.</p>
          <p className="pl-nota">Comienza cuando tu sistema está entregado. Permanencia mínima de 3 meses.</p>
          <ul className="pl-check">{MENSUAL.map((t) => <li key={t}>{t}</li>)}</ul>
          <a className="btn btn-big pl-pagar pl-pagar-sec" href="/api/pagar?plan=mes">Pagar mensualidad</a>
        </Tilt>
      </section>

      <section className="lp-sec">
        <div className="pl-claridad">
          <div className="pl-col"><h3>Tú pones</h3><ul>{TU_PARTE.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="pl-col"><h3>No incluye</h3><ul>{NO_INCLUYE.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="pl-col pl-col-garantia"><h3>Garantía de entrega</h3><p>Si el día 30 no está entregado lo acordado, seguimos trabajando sin costo hasta entregarlo. No prometemos ventas: prometemos ejecutar con excelencia y medir con total transparencia.</p></div>
        </div>
      </section>

      <section className="lp-final">
        <h2 className="lp-h2">¿Quieres saber si es para ti?</h2>
        <p className="lp-lead">Responde 5 preguntas y te decimos con honestidad si podemos trabajar juntos.</p>
        <Link href="/aplicar" className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
        <p className="muted small">Pago seguro con Bold, con tarjeta de crédito o débito.</p>
      </section>

      <footer className="lp-foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" />
        <nav className="lp-legal" aria-label="Legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></nav>
      </footer>
    </div>
  );
}
