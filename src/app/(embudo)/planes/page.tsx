import Link from "next/link";
import type { Metadata } from "next";
import { Tilt } from "@/components/landing/tilt";

// Página de venta (no enlazada desde la landing: se envía después de la calificación o en la cotización).
export const metadata: Metadata = {
  title: "Planes — Conexión",
  description: "Dirección de Captación Conexión: estrategia, guiones, videos, campañas y tu panel en el celular, por una cuota mensual.",
  robots: { index: false, follow: false },
};

const INCLUYE_MES = [
  ["🎯", "Estrategia y comité mensual de captación"],
  ["✍️", "8 guiones al mes con tu voz"],
  ["🎥", "1 rodaje dirigido en remoto por Fer"],
  ["🎬", "8 videos editados con motion y subtítulos (16 versiones de gancho)"],
  ["📣", "Hasta 2 campañas activas y optimizadas"],
  ["🧲", "Landing con preguntas de calificación"],
  ["📱", "Panel en tu celular: leads, citas, ventas y alertas"],
  ["📊", "Parte semanal: 3 números y 1 decisión"],
];

const NO_INCLUYE = ["La pauta (se paga directo a Meta)", "Manejo de comunidad y respuesta de mensajes", "Grabación presencial", "WordPress y correos corporativos", "Módulos nuevos del panel (se cotizan)", "Garantía de ventas"];

const TU_PARTE = ["Grabar 90 minutos al mes, en la fecha que agendamos", "Tener a alguien que atienda los leads", "Revisar y aprobar en 48 horas"];

export default function PlanesPage() {
  return (
    <div className="lp planes">
      <header className="lp-top">
        <Link href="/vsl" aria-label="Conexión">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Conexión" className="lp-top-logo" />
        </Link>
        <Link href="/aplicar" className="btn lp-top-cta" data-evento="cta_aplicar">¿Es para mí?</Link>
      </header>

      <section className="lp-hero pl-hero">
        <p className="eyebrow">Planes Conexión</p>
        <h1 className="lp-h1">Dirección de Captación</h1>
        <p className="lp-lead">Una cuota mensual. Estrategia, guiones, videos, campañas y tu panel en el celular, dirigidos por humanos y ejecutados con IA.</p>
      </section>

      {/* Plan principal */}
      <section className="lp-sec pl-principal">
        <Tilt className="pl-card pl-card-main">
          <span className="plan-tag">Plan principal · boutique</span>
          <h2>Dirección de Captación Conexión</h2>
          <div className="plan-precio"><small>USD</small>1.500<span className="plan-mes">/mes</span></div>
          <ul className="pl-incluye">
            {INCLUYE_MES.map(([i, t]) => <li key={t}><span aria-hidden="true">{i}</span>{t}</li>)}
          </ul>
        </Tilt>

        <div className="pl-entradas">
          <p className="pl-sub">Elige cómo empezar</p>
          <Tilt className="pl-entrada">
            <span className="pl-badge">Más flexible</span>
            <h3>Compromiso 3 meses</h3>
            <p className="pl-monto"><b>USD 1.800</b> implementación única + USD 1.500/mes</p>
            <p className="pl-nota">Lista en 30 días: estrategia, guiones, landing, panel y campañas.</p>
            <a className="btn btn-big pl-pagar" href="/api/pagar?plan=impl3">Pagar implementación</a>
          </Tilt>
          <Tilt className="pl-entrada pl-entrada-top">
            <span className="pl-badge rojo">Mejor valor</span>
            <h3>Compromiso 6 meses</h3>
            <p className="pl-monto"><b>USD 900</b> implementación + USD 1.500/mes</p>
            <p className="pl-nota">Ahorras USD 900 y te regalamos un video de la historia de tu marca.</p>
            <a className="btn btn-big pl-pagar" href="/api/pagar?plan=impl6">Pagar implementación</a>
          </Tilt>
          <a className="pl-mensual" href="/api/pagar?plan=mes">¿Ya eres cliente? Paga tu mensualidad (USD 1.500) →</a>
        </div>
      </section>

      {/* Escalón de entrada */}
      <section className="lp-sec">
        <Tilt className="pl-card pl-sprint">
          <div>
            <span className="plan-tag">¿Quieres empezar más pequeño?</span>
            <h2>Sprint de Marca y Guion</h2>
            <p>10 días hábiles: arquetipo de marca, cliente ideal, tu mensaje diferencial, 4 guiones y un plan de captación. <strong>Si contratas la Dirección dentro de 30 días, te descontamos el valor completo.</strong></p>
          </div>
          <div className="pl-sprint-cta">
            <div className="plan-precio"><small>USD</small>490</div>
            <a className="btn btn-big pl-pagar" href="/api/pagar?plan=sprint">Pagar Sprint</a>
          </div>
        </Tilt>
      </section>

      {/* Claridad */}
      <section className="lp-sec">
        <div className="pl-claridad">
          <div className="pl-col"><h3>Tú pones</h3><ul>{TU_PARTE.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="pl-col pl-col-no"><h3>No incluye</h3><ul>{NO_INCLUYE.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="pl-col pl-col-garantia"><h3>Garantía de entrega</h3><p>Si el día 30 no está entregado lo acordado, seguimos trabajando sin costo hasta entregarlo. No prometemos ventas: prometemos ejecutar y medir con total transparencia.</p></div>
        </div>
      </section>

      <section className="lp-final">
        <h2 className="lp-h2">¿No sabes cuál es para ti?</h2>
        <p className="lp-lead">Responde 5 preguntas y te decimos con honestidad qué te conviene.</p>
        <Link href="/aplicar" className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
        <p className="muted small">Pago seguro con Bold: tarjeta, PSE, Nequi o Botón Bancolombia. Pocas plazas al mes.</p>
      </section>

      <footer className="lp-foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" />
        <nav className="lp-legal" aria-label="Legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></nav>
      </footer>
    </div>
  );
}
