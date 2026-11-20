import Link from "next/link";
import { CotizarForm } from "./form";

export const metadata = { title: "Cotiza tu proyecto — Conexión", description: "Pide la cotización de tu sistema de captación, landing, embudo, panel, videos o campañas." };

export default async function CotizarPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams;
  return (
    <main className="typ" style={{ maxWidth: 760 }}>
      <Link href="/vsl" aria-label="Volver al inicio">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      </Link>
      <p className="eyebrow">Cotización</p>
      <h1 className="lp-h2">Cotiza tu proyecto</h1>
      <p className="lp-lead">Elige lo que necesitas y cuéntanos de tu marca. Te enviamos una propuesta clara a tu correo.</p>
      {plan && <div className="alert ok">El pago en línea se está activando. Déjanos tus datos y te enviamos tu link de pago seguro por correo y WhatsApp hoy mismo.</div>}
      <CotizarForm />
    </main>
  );
}
