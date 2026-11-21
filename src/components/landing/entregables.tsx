// Entregables con mockups. Todo se dibuja en código (marcos de celular, portátil y hoja) para no usar
// plantillas con marcas de terceros. Las capturas de /public/entregables son de la web real de Conexión;
// el panel, el anuncio y los mensajes son ilustraciones con datos de ejemplo (nunca datos reales de leads).

type Img = { src: string; alt: string; w: number; h: number };

function Foto({ src, alt, w, h }: Img) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />;
}

function Celular({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`ent-cel ${className}`}>
      <div className="ent-cel-pantalla">{children}</div>
    </div>
  );
}

function Portatil({ children, url }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="ent-port">
      <div className="ent-port-tapa">
        <div className="ent-nav" aria-hidden="true"><i /><i /><i />{url && <span>{url}</span>}</div>
        <div className="ent-port-pantalla">{children}</div>
      </div>
      <div className="ent-port-base" aria-hidden="true" />
    </div>
  );
}

function Lineas({ n, corta }: { n: number; corta?: boolean }) {
  return <>{Array.from({ length: n }, (_, i) => <span key={i} className="ent-linea" style={{ width: corta && i === n - 1 ? "55%" : undefined }} />)}</>;
}

/* ---------- Mockups del mes 1 ---------- */

function MockGuion() {
  return (
    <div className="ent-hojas" role="img" aria-label="Documentos de estrategia de marca y guion de VSL">
      <div className="ent-hoja ent-hoja-atras">
        <p className="ent-hoja-tit">Estrategia de marca</p>
        {["Cliente ideal", "Mensaje", "Oferta"].map((t) => <div key={t} className="ent-bloque"><b>{t}</b><Lineas n={2} corta /></div>)}
      </div>
      <div className="ent-hoja">
        <p className="ent-hoja-tit">Guion · VSL</p>
        {["Gancho", "Problema", "Solución", "Llamado a la acción"].map((t, i) => (
          <div key={t} className="ent-bloque"><b><em>{String(i + 1).padStart(2, "0")}</em>{t}</b><Lineas n={i === 3 ? 1 : 2} corta /></div>
        ))}
      </div>
    </div>
  );
}

function MockLanding() {
  return (
    <div className="ent-combo">
      <Portatil url="conexionteam.app">
        <Foto src="/entregables/landing-escritorio.webp" alt="Landing de Conexión vista en computador: titular, video y botón" w={1400} h={875} />
      </Portatil>
      <Celular className="ent-cel-flota">
        <Foto src="/entregables/landing-movil.webp" alt="Landing de Conexión vista en celular" w={560} h={1212} />
      </Celular>
    </div>
  );
}

function MockEmbudo() {
  const pasos = ["Landing", "Preguntas", "Agenda", "Gracias"];
  return (
    <div className="ent-embudo">
      <Celular>
        <Foto src="/entregables/preguntas-movil.webp" alt="Preguntas de calificación del embudo de Conexión en celular" w={560} h={1212} />
      </Celular>
      <ol className="ent-pasos" aria-label="Pasos del embudo">
        {pasos.map((p, i) => <li key={p}><b>{i + 1}</b>{p}</li>)}
      </ol>
    </div>
  );
}

function MockAnuncio() {
  return (
    <div className="ent-anuncio" role="img" aria-label="Ilustración de un anuncio para redes sociales con el video y el titular de la marca">
      <div className="ent-anuncio-top">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="" width={28} height={28} loading="lazy" />
        <span><b>Conexión</b><small>Publicidad</small></span>
      </div>
      <p className="ent-anuncio-txt">Implementamos tu sistema de captación con IA.</p>
      <div className="ent-anuncio-img">
        <Foto src="/entregables/anuncio.webp" alt="" w={480} h={600} />
        <span className="ent-play" aria-hidden="true" />
      </div>
      <div className="ent-anuncio-pie"><span>Quiero saber si es para mí</span><b>Más información</b></div>
    </div>
  );
}

function MockPanel() {
  const embudo = [["Vistas", 100], ["Clic", 46], ["Aplicaron", 24], ["Agendaron", 14], ["Pagaron", 5]] as const;
  return (
    <div className="ent-panel-wrap">
      <Portatil url="tu-marca · panel">
        <div className="ent-panel" role="img" aria-label="Ilustración del panel con datos de ejemplo: indicadores del día, embudo por pasos, leads y agenda">
          <aside className="ent-panel-menu" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-3d.png" alt="" width={24} height={24} loading="lazy" />
            {["Hoy", "Leads", "Agenda", "Ventas", "Equipo", "Campañas"].map((t, i) => <span key={t} className={i === 0 ? "on" : ""}>{t}</span>)}
          </aside>
          <div className="ent-panel-main">
            <div className="ent-panel-head"><b>Hoy</b><span className="ent-demo">Datos de ejemplo</span></div>
            <div className="ent-kpis">
              {[["Leads", "18"], ["Citas", "6"], ["Ventas", "3"], ["Por cobrar", "2"]].map(([l, v]) => <div key={l}><small>{l}</small><b>{v}</b></div>)}
            </div>
            <div className="ent-panel-dos">
              <div className="ent-caja">
                <small>Embudo</small>
                {embudo.map(([l, v]) => <div key={l} className="ent-barra"><span>{l}</span><i style={{ width: `${v}%` }} /></div>)}
              </div>
              <div className="ent-caja">
                <small>Agenda</small>
                {["09:00", "11:30", "16:00"].map((h, i) => <div key={h} className="ent-cita"><b>{h}</b><span>Diagnóstico · Lead demo {i + 1}</span></div>)}
                <div className="ent-alerta"><i />Una campaña subió su costo por lead</div>
              </div>
            </div>
          </div>
        </div>
      </Portatil>
      <MockMensajes />
    </div>
  );
}

function MockMensajes() {
  return (
    <Celular>
      <div className="ent-chat" role="img" aria-label="Ilustración de recordatorios automáticos de la cita por WhatsApp y correo">
        <div className="ent-chat-top"><span className="ent-avatar">C</span><b>Tu marca</b></div>
        <p className="ent-burbuja">Hola. Te recordamos tu diagnóstico de mañana a las 10:00.</p>
        <p className="ent-burbuja">Este es el enlace para entrar a la llamada.</p>
        <p className="ent-burbuja ent-yo">Perfecto, ahí estaré</p>
        <div className="ent-correo"><b>Correo</b><span>Tu cita quedó confirmada</span></div>
        <div className="ent-correo"><b>Cobro</b><span>Tu link de pago seguro</span></div>
      </div>
    </Celular>
  );
}

/* ---------- Mockups mensuales ---------- */

function MockOchoGuiones() {
  return (
    <div className="ent-pila" role="img" aria-label="Ocho guiones al mes">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <div key={n} className="ent-mini" style={{ ["--i" as string]: n - 1, ["--x" as string]: (n - 1) % 4, ["--y" as string]: Math.floor((n - 1) / 4) } as React.CSSProperties}>
          <b>Guion {String(n).padStart(2, "0")}</b>
          <Lineas n={3} corta />
        </div>
      ))}
    </div>
  );
}

function MockVideos() {
  const v = [
    ["/entregables/video-1.webp", ""],
    ["/entregables/video-2.webp", "Si lo puedes imaginar, lo podemos crear."],
    ["/entregables/video-3.webp", ""],
  ];
  return (
    <div className="ent-videos" role="img" aria-label="Videos verticales editados con subtítulos">
      {v.map(([src, sub], i) => (
        <Celular key={src} className={`ent-cel-video ent-cel-v${i}`}>
          <Foto src={src} alt="" w={320} h={569} />
          {sub && <span className="ent-sub">{sub}</span>}
        </Celular>
      ))}
    </div>
  );
}

function MockParte() {
  return (
    <Celular>
      <div className="ent-parte" role="img" aria-label="Ilustración del parte semanal con tres números y una decisión, con datos de ejemplo">
        <div className="ent-chat-top"><span className="ent-avatar">C</span><b>Parte semanal</b></div>
        <span className="ent-demo">Ejemplo</span>
        {[["Leads", "42"], ["Citas", "11"], ["Ventas", "4"]].map(([l, v]) => <div key={l} className="ent-num"><small>{l}</small><b>{v}</b></div>)}
        <div className="ent-decision"><small>1 decisión</small>Más presupuesto al anuncio con menor costo por lead</div>
      </div>
    </Celular>
  );
}

function MockComite() {
  const dias = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div className="ent-cal" role="img" aria-label="Calendario con el comité mensual de captación agendado">
      <div className="ent-cal-mes"><b>Comité mensual</b><small>videollamada con Fer</small></div>
      <div className="ent-cal-grid" aria-hidden="true">
        {dias.map((d) => <span key={d} className={d === 3 ? "on" : ""}>{d}</span>)}
      </div>
      <div className="ent-cal-ev"><i />Comité de captación · resultados y plan del mes</div>
    </div>
  );
}

/* ---------- Sección ---------- */

type Item = { titulo: string; texto: string; mock: React.ReactNode; nota?: string; ancho?: boolean };

const MES1: Item[] = [
  { titulo: "Estrategia y guion de tu VSL", texto: "Diagnóstico, cliente ideal, mensaje y oferta. Luego los guiones de tu VSL y de tus primeras piezas, con tu voz.", mock: <MockGuion /> },
  { titulo: "Landing con tu VSL", texto: "Tu página de venta con video, lista en computador y en celular.", mock: <MockLanding />, nota: "Captura real: la landing de Conexión" },
  { titulo: "Embudo completo", texto: "Landing, preguntas de calificación, agenda automática y página de gracias.", mock: <MockEmbudo />, nota: "Captura real: las preguntas del embudo de Conexión" },
  { titulo: "Campañas en Meta", texto: "Estructura, públicos, anuncios y configuración, cuando el guion, los videos y la landing ya están listos.", mock: <MockAnuncio />, nota: "Ilustración" },
  { titulo: "Tu panel a la medida, analítica y automatizaciones", texto: "Leads, citas, ventas, alertas y tu equipo, en tu celular. Píxel, UTMs y el embudo medido paso a paso, de cada anuncio a cada venta. Recordatorios por correo y WhatsApp, cobros y flujos de seguimiento.", mock: <MockPanel />, nota: "Ilustración con datos de ejemplo", ancho: true },
];

const MENSUAL: Item[] = [
  { titulo: "8 guiones al mes", texto: "Te pasamos los guiones listos para grabar, con tu voz y en el orden de tu estrategia.", mock: <MockOchoGuiones /> },
  { titulo: "Rodaje dirigido en remoto y 8 videos editados", texto: "Tú grabas y te dirigimos a distancia; nosotros editamos con motion y subtítulos. Tú publicas.", mock: <MockVideos />, nota: "Material de Conexión" },
  { titulo: "Campañas, panel y parte semanal", texto: "Gestionamos y optimizamos tus campañas, mantenemos tu panel, analítica y alertas al día, y cada semana recibes 3 números y 1 decisión.", mock: <MockParte />, nota: "Ilustración con datos de ejemplo" },
  { titulo: "Comité mensual de captación con Fer", texto: "Una reunión al mes para revisar resultados y decidir el plan del mes siguiente.", mock: <MockComite /> },
];

function Grupo({ items, cols }: { items: Item[]; cols: 2 | 3 }) {
  return (
    <ul className={`ent-grid ent-grid-${cols}`}>
      {items.map((it) => (
        <li key={it.titulo} className={`ent-card${it.ancho ? " ent-card-ancha" : ""}`}>
          <div className="ent-escena">{it.mock}</div>
          <div className="ent-txt">
            <h4>{it.titulo}</h4>
            <p>{it.texto}</p>
            {it.nota && <small className="ent-nota">{it.nota}</small>}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Entregables() {
  return (
    <section className="lp-sec ent" id="entregables">
      <p className="eyebrow">Entregables</p>
      <h2 className="lp-h2">Esto es lo que <span className="texto-acento">recibes</span></h2>
      <p className="lp-sub">Así se ven las piezas. Las tuyas se diseñan con tu marca, tu voz y los datos de tu negocio.</p>

      <div className="ent-grupo">
        <div className="ent-grupo-head">
          <span className="plan-tag">Mes 1 · Implementación</span>
          <h3>Tu sistema de captación, listo en 30 días</h3>
          <p className="ent-precio-linea"><b>USD 1.800</b> · pago único</p>
        </div>
        <Grupo items={MES1} cols={3} />
        <p className="ent-ademas">Además: seguimiento durante el mes, capacitación a tu equipo y entrega funcionando.</p>
      </div>

      <div className="ent-grupo">
        <div className="ent-grupo-head">
          <span className="plan-tag">Desde el mes 2 · Si sigues con nosotros</span>
          <h3>Dirección de Captación, cada mes</h3>
          <p className="ent-precio-linea"><b>USD 1.500/mes</b> · precio con descuento por continuar</p>
        </div>
        <Grupo items={MENSUAL} cols={2} />
      </div>
    </section>
  );
}
