import Link from "next/link";
import type { Metadata } from "next";
import { VslVideo } from "@/components/vsl-video";
import { Sistema } from "@/components/landing/sistema";
import { Tilt } from "@/components/landing/tilt";
import { Historia } from "@/components/landing/historia";

export const metadata: Metadata = {
  title: "Conexión — Sistemas de captación con IA para marcas boutique",
  description: "Implementamos tu sistema de captación con IA: landing, embudo, panel, videos y campañas, conectados y a tu medida. Abrimos pocas plazas al mes.",
};

type Props = { searchParams: Promise<{ utm_source?: string; utm_campaign?: string; utm_medium?: string; utm_content?: string }> };

// Personas y marcas con las que se ha trabajado (dato dado por Fernanda, 19-nov-2026).
const TRAYECTORIA = [
  "Juan Ads", "María Elena Badillo", "Marco Lesama", "Jorge Serratos", "Manuel de León",
  "Dra. Diana y Dr. Camilo", "Elizabeth García Duque", "Adriana Vargas", "Empresas en España", "Marcas en todo el mundo",
];

const TITULO = ["Implementamos", "tu", "sistema", "de", "captación", "con", "IA."];

export default async function VslPage({ searchParams }: Props) {
  const utm = await searchParams;
  const qs = new URLSearchParams(Object.entries(utm).filter(([, v]) => v) as [string, string][]).toString();
  const aplicar = `/aplicar${qs ? `?${qs}` : ""}`;

  return (
    <div className="lp">
      <header className="lp-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" className="lp-top-logo" />
        <Link href={aplicar} className="btn lp-top-cta" data-evento="cta_aplicar">Aplicar</Link>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <p className="eyebrow">Agencia boutique · pocas plazas al mes</p>
        <h1 className="lp-h1" aria-label={TITULO.join(" ")}>
          {TITULO.map((w, i) => (
            <span key={i} className={`lp-w${w === "IA." ? " rojo" : ""}`} style={{ animationDelay: `${0.12 + i * 0.07}s` }} aria-hidden="true">{w}</span>
          ))}
        </h1>
        <p className="lp-lead">Tu landing, tu embudo, tu panel, tus videos y tus campañas: todo conectado y hecho a la medida de tu marca. Mira este video de un minuto.</p>
        <div className="vsl-frame lp-video"><VslVideo /></div>
        <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Aplicar para una llamada</Link>
        <p className="muted small">Llamada gratuita de 45 minutos. Revisamos tu caso antes de confirmar.</p>
      </section>

      {/* Historia */}
      <section className="lp-sec lp-historia">
        <p className="eyebrow">Soy Fer · la Sabia Creativa</p>
        <h2 className="lp-h2">Esta no es la historia de una agencia. Es la mía.</h2>
        <p className="lp-sub">Desliza las escenas. Cada caída me enseñó algo que hoy uso en tu marca.</p>
        <Historia />
      </section>

      {/* El sistema */}
      <section className="lp-sec">
        <p className="eyebrow">Qué implementamos</p>
        <h2 className="lp-h2">Un solo sistema, cinco piezas que trabajan juntas</h2>
        <p className="lp-sub">No vendemos piezas sueltas. Construimos el camino completo que lleva a una persona desde el anuncio hasta la venta, y lo dejamos funcionando con tu equipo.</p>
        <Sistema />
      </section>

      {/* Trayectoria */}
      <section className="lp-sec lp-tray">
        <p className="eyebrow">Trayectoria</p>
        <h2 className="lp-h2">Detrás de Conexión hay años construyendo al lado de marcas que venden</h2>
        <p className="lp-sub">Creadores, expertos, médicos y empresas en Latinoamérica, España y otros países. Esto es parte de ese camino:</p>
        <div className="marquee" aria-label="Personas y marcas con las que hemos trabajado">
          {[0, 1].map((fila) => (
            <div key={fila} className={`marquee-fila${fila ? " inversa" : ""}`} aria-hidden={fila === 1}>
              {[...TRAYECTORIA, ...TRAYECTORIA].map((n, i) => (
                <span key={i} className="marquee-item" aria-hidden={i >= TRAYECTORIA.length || fila === 1}>{n}<i aria-hidden="true">●</i></span>
              ))}
            </div>
          ))}
        </div>
        <ul className="sr-only">{TRAYECTORIA.map((n) => <li key={n}>{n}</li>)}</ul>
        <div className="lp-regiones">
          {["Latinoamérica", "España", "El mundo"].map((r) => <span key={r} className="pill">{r}</span>)}
        </div>
      </section>

      {/* Boutique */}
      <section className="lp-sec">
        <Tilt className="lp-boutique">
          <div className="lp-boutique-in">
            <p className="eyebrow">Boutique de verdad</p>
            <h2 className="lp-h2">Abrimos pocas plazas cada mes</h2>
            <p>Trabajamos con pocos clientes a la vez para estar de verdad en cada proyecto: atención directa, sin intermediarios y con el sistema completo en tus manos.</p>
            <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Aplicar para una plaza</Link>
          </div>
        </Tilt>
      </section>

      {/* Cómo empezamos */}
      <section className="lp-sec">
        <p className="eyebrow">Cómo empezamos</p>
        <h2 className="lp-h2">Tres pasos</h2>
        <ol className="lp-pasos">
          {[
            ["Aplicas", "Cuatro preguntas rápidas para entender tu negocio y lo que necesitas."],
            ["Hablamos 45 minutos", "Revisamos tu caso, te decimos con honestidad si somos para ti y qué haríamos."],
            ["Implementamos tu sistema", "Construimos landing, embudo, panel, videos y campañas, y los dejamos funcionando."],
          ].map(([t, d], i) => (
            <li key={t}><Tilt className="lp-paso"><span className="lp-paso-n">{i + 1}</span><h3>{t}</h3><p>{d}</p></Tilt></li>
          ))}
        </ol>
      </section>

      <section className="lp-final">
        <h2 className="lp-h2">Tu marca ya tiene algo que decir.<br /><span className="rojo">Hagamos que se vea y se venda.</span></h2>
        <Link href={aplicar} className="btn btn-big" data-evento="cta_aplicar">Aplicar para una llamada</Link>
      </section>

      <footer className="lp-foot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Conexión" />
        <span>Conexión · Agencia boutique · Medellín · conexionteam.app</span>
      </footer>
    </div>
  );
}
