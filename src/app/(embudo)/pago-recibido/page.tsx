import Link from "next/link";

export const metadata = { title: "Pago recibido — Conexión", robots: { index: false } };

// Bold redirige aquí después del pago (callback_url del link).
export default function PagoRecibido() {
  return (
    <main className="typ">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
      <span className="typ-check" aria-hidden="true">✓</span>
      <h1 className="lp-h2">Gracias, recibimos tu pago</h1>
      <p className="lp-lead">Bold te envía el comprobante a tu correo. Nuestro equipo te escribe por WhatsApp para los siguientes pasos.</p>
      <Link href="/vsl" className="btn">Volver a Conexión</Link>
    </main>
  );
}
