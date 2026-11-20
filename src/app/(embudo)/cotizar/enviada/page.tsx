import Link from "next/link";

export const metadata = { title: "Cotización recibida — Conexión" };

export default function CotizacionEnviada() {
  return (
    <main className="typ">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
      <span className="typ-check" aria-hidden="true">✓</span>
      <h1 className="lp-h2">Recibimos tu solicitud</h1>
      <p className="lp-lead">Revisa tu correo: te llega la confirmación con lo que pediste. Preparamos tu propuesta y te escribimos.</p>
      <p className="muted small">¿Prefieres hablarlo en vivo? Puedes agendar una llamada gratuita de 30 minutos.</p>
      <Link href="/aplicar" className="btn btn-big" data-evento="cta_aplicar">Quiero saber si es para mí</Link>
    </main>
  );
}
