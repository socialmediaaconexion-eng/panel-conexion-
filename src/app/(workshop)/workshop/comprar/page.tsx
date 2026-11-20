import Link from "next/link";
import type { Metadata } from "next";
import { WORKSHOP, precioTexto } from "@/lib/workshop";
import { temarioPublico } from "@/lib/cursos";
import { ComprarForm } from "./form";

export const metadata: Metadata = { title: `Comprar ${WORKSHOP.nombre} — Conexión`, robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ moneda?: string }> };

export default async function ComprarPage({ searchParams }: Props) {
  const { moneda } = await searchParams;
  const t = await temarioPublico(WORKSHOP.slug);
  const cop = precioTexto(t?.curso.precio_cop, "COP");
  const usd = precioTexto(t?.curso.precio_usd, "USD");
  return (
    <main className="embudo ws-pagina">
      <Link href="/workshop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
      </Link>
      <p className="eyebrow">Último paso</p>
      <h1 className="embudo-h1">Entra a <em>{t?.curso.titulo || WORKSHOP.nombre}</em></h1>
      <p className="embudo-lead">Déjanos tus datos para crear tu acceso. Después pagas en Bold y te llega el usuario y la contraseña a tu correo.</p>
      {t ? <ComprarForm cop={cop} usd={usd} paises={WORKSHOP.paises} inicial={moneda === "USD" ? "" : "Colombia"} notaCop={WORKSHOP.notaCop} /> : <div className="alert error">El workshop no está disponible en este momento.</div>}
      <p className="muted small">{WORKSHOP.garantia} Pago único · {WORKSHOP.marca}</p>
    </main>
  );
}
