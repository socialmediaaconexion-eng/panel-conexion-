import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conexión — Agencia boutique de marca, diseño y landing pages",
  description: "Manuales de marca, diseño para ads y redes, y landing pages que convierten. Aplica para una llamada con el equipo.",
};

type Props = { searchParams: Promise<{ utm_source?: string; utm_campaign?: string }> };

export default async function VslPage({ searchParams }: Props) {
  const utm = await searchParams;
  const qs = new URLSearchParams(Object.entries(utm).filter(([, v]) => v) as [string, string][]).toString();
  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dorado.png" alt="Conexión" className="embudo-logo" />
      <p className="eyebrow">Agencia boutique · pocos clientes, atención directa</p>
      <h1 className="embudo-h1">Tu marca ya tiene algo que decir. Nosotros hacemos que se vea y se venda como tal.</h1>
      <p className="embudo-lead">Mira este video de un minuto: cómo trabajamos manuales de marca, diseño para ads y redes, y landing pages — con atención directa, como agencia boutique.</p>

      <div className="vsl-frame">
        <video controls preload="metadata" poster="/vsl-poster.jpg" playsInline>
          <source src="/vsl.mp4" type="video/mp4" />
        </video>
      </div>

      <Link href={`/aplicar${qs ? `?${qs}` : ""}`} className="btn btn-big">Aplicar para una llamada</Link>
      <p className="muted small">La llamada es gratuita y dura 45 minutos. Revisamos tu caso antes de confirmar.</p>

      <section className="embudo-servicios">
        <div><h2>Manuales de marca</h2><p className="muted">Identidad, paleta, tipografías y reglas de uso para que tu marca se vea igual en todos lados.</p></div>
        <div><h2>Diseños para ads y redes</h2><p className="muted">Piezas listas para pauta y contenido, alineadas a tu manual y pensadas para convertir.</p></div>
        <div><h2>Landing pages y funnels</h2><p className="muted">Páginas que explican tu oferta y llevan a la persona a agendar o comprar.</p></div>
      </section>
    </main>
  );
}
