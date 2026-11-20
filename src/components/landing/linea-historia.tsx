"use client";

import { useEffect, useRef } from "react";

// "Mi historia" según HISTORIA.md de Fernanda (Landing Conexion\5 - Historia personal).
// Todos los clips van mudos (se les quitó el audio): varios hablan de otro proyecto y no deben sonar aquí.
type Medio = { tipo: "foto" | "video"; src: string; alt: string };
type Capitulo = { n: string; titulo: string; texto: string; medios: Medio[]; oscuro?: boolean };

const f = (src: string, alt: string): Medio => ({ tipo: "foto", src: `/historia/${src}.webp`, alt });
const v = (src: string, alt: string): Medio => ({ tipo: "video", src: `/historia/${src}`, alt });

const CAPITULOS: Capitulo[] = [
  {
    n: "01", titulo: "El origen: detrás de cámara",
    texto: "Empecé en producción audiovisual en Medellín. Luces, cámaras, guiones. Ahí aprendí lo que hoy aplico en cada VSL: si no capturas la atención en 3 segundos, no existes.",
    medios: [v("origen-gimbal-montana", "Fer grabando con gimbal en la montaña"), v("origen-set", "Set de producción"), f("origen-camara-2021", "Detrás de cámara, 2021"), v("origen-gimbal-campo", "Grabando en exteriores"), f("conexion1-equipo-set", "Equipo en un set de grabación"), f("origen-tripode-2021", "Grabación en la calle, 2021"), v("origen-edicion", "Editando"), f("conexion1-gorras", "Primeras gorras del equipo de Conexión, 2022"), f("conexion1-equipo-2022", "Primer equipo de Conexión, 2022"), v("conexion1-equipo-grabando", "El equipo grabando"), f("conexion1-fer-2021", "Fer con su cámara"), f("origen-estudio", "Sesión de fotos en estudio"), f("origen-noche", "Sesión de fotos de noche")],
  },
  {
    n: "02", titulo: "Lanzamientos de verdad",
    texto: "Pasé de grabar a medir. Hook rate, CTR, retención por segundo, costo por lead. Estuve dentro de lanzamientos que superaron los USD 100.000 en ventas, viendo qué funcionaba y qué no, número por número.",
    medios: [f("lanzamiento-kajabi", "Panel de Kajabi de un lanzamiento con más de USD 100.000 en ventas"), f("lanzamiento-pizarra", "Pizarra con métricas de un embudo")],
  },
  {
    n: "03", titulo: "El ecosistema 1+1=3",
    texto: "Me formé y trabajé en un ecosistema donde todo se mide y todo se ejecuta. Embudos, closers, eventos, equipos. Ahí entendí que la sinergia multiplica: 1+1=3.",
    medios: [v("ecosistema-guadalajara", "Evento en Guadalajara, México"), f("ecosistema-oficina", "Oficina con el lema 1+1=3"), v("ecosistema-equipo-trabajando", "Equipo trabajando"), v("ecosistema-gracias-equipo", "Gracias, equipo"), v("ecosistema-1mas1", "1+1=3"), v("ecosistema-trabajo", "Trabajando en la oficina"), v("ecosistema-evento", "Salón preparado para un evento"), f("ecosistema-camiseta", "Fernanda con la camiseta 1+1=3"), v("ecosistema-calendario", "Oficina")],
  },
  {
    n: "04", titulo: "La caída", oscuro: true,
    texto: "Y un día todo frenó. Ambulancia, radiografía, hombro lesionado. Por un tiempo no pude ni sostener el portátil como antes.",
    medios: [f("caida-ambulancia", "Dentro de una ambulancia"), f("caida-radiografia", "Radiografía del hombro"), f("caida-cicatriz", "Cicatriz de la recuperación")],
  },
  {
    n: "05", titulo: "Construir de noche",
    texto: "En vez de parar, aprendí a construir. Con Claude y mucho código a medianoche armé los sistemas que hoy uso con clientes: embudos, pasarelas de pago y un panel CRM que se ve desde el celular. Así nació Conexión.",
    medios: [f("noche-codigo", "Programando de noche"), v("noche-ama-su-trabajo", "Fer en la oficina"), v("noche-guardando-equipos", "Guardando equipos después de grabar una clase"), v("noche-streaming", "Produciendo un streaming"), v("noche-escritorio", "Trabajando en el escritorio"), v("noche-panel", "Un panel de agendamiento que construí"), v("noche-llamada", "Llamada con el equipo"), v("noche-equipo", "Equipo en la terraza")],
  },
  {
    n: "06", titulo: "Lo humano",
    texto: "Y sigo siendo yo: la que viaja, se ríe y se monta en la atracción de la feria. Por eso en Conexión el marketing se gestiona con IA, pero humanamente.",
    medios: [f("humano-feria", "Fernanda sonriendo en la feria"), v("humano-risa", "Riendo en la calle"), f("humano-san-miguel", "Viaje a San Miguel de Allende"), f("humano-vuelo", "Mirando por la ventana del avión"), v("humano-vuelo-atardecer", "Atardecer desde el avión"), v("humano-vuelo-noche", "Volando de noche"), v("humano-moto", "En moto"), v("humano-caminando", "Caminando"), f("humano-terraza-1", "Terraza de noche"), f("humano-terraza-2", "Terraza de noche"), v("humano-terraza-atardecer", "Terraza al atardecer")],
  },
];

// Los videos solo se reproducen cuando se ven (ahorra batería y datos).
function Clip({ m }: { m: Medio }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause(); }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} muted loop playsInline preload="none" poster={`${m.src}.jpg`} aria-label={m.alt}><source src={`${m.src}.mp4`} type="video/mp4" /></video>;
}

export function LineaHistoria() {
  return (
    <ol className="lh">
      {CAPITULOS.map((c) => (
        <li key={c.n} className={`lh-cap${c.oscuro ? " lh-oscuro" : ""}`}>
          <div className="lh-marca" aria-hidden="true"><span>{c.n}</span></div>
          <div className="lh-cuerpo">
            {/* Cinta en movimiento continuo hacia la derecha (pausa al pasar el mouse o tocar); la copia es solo para el bucle. */}
            <div className="lh-medios" tabIndex={0}>
              <div className="lh-cinta" style={{ ["--n" as string]: c.medios.length }}>
                {[false, true].flatMap((copia) => c.medios.map((m) => (
                  <figure key={`${copia ? "b" : "a"}-${m.src}`} className="lh-medio" aria-hidden={copia || undefined}>
                    {m.tipo === "foto"
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.src} alt={copia ? "" : m.alt} loading="lazy" decoding="async" />
                      : <Clip m={m} />}
                  </figure>
                )))}
              </div>
            </div>
            <div className="lh-texto">
              <p className="lh-n">Capítulo {c.n}</p>
              <h3>{c.titulo}</h3>
              <p>{c.texto}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
