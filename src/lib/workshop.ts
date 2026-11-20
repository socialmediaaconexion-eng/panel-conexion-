// Configuración y copy de ALMA by Conexión (el workshop low cost).
// Fuente del copy: "Workshop Conexion\1 - Producto del workshop.md" (estratega de producto, 20-nov-2026), sección 7.
// - Nombre, descripción, precios (USD y COP) y meses de acceso viven en la tabla `cursos` (Panel → Workshop → Contenido).
// - Módulos y lecciones viven en `modulos` y `lecciones` (la landing los lee de la base de datos).
// - Este archivo guarda el copy de la landing. Lo que depende de una decisión pendiente de Fer va con una bandera.

export const WORKSHOP = {
  // Curso que vende la landing /workshop (alias /alma). Debe existir en `cursos` y estar activo.
  slug: "alma",
  embudo: "workshop",
  nombre: "ALMA",
  marca: "ALMA by Conexión",
  siglas: "Arquetipo · Landing · Marca · Agentes",

  // ── Decisiones de Fer. clinica y comunidad confirmadas (20-nov-2026); el abono sigue pendiente (#9). ──
  pendientes: {
    clinicaMensual: true,        // Clínica ALMA en vivo, 1 sesión al mes (confirmada)
    comunidad: true,             // Grupo exclusivo + comunidad en Skool (confirmada)
    abonoImplementacion: false,  // #9 Abono de los USD 45 si compra la implementación en 60 días (pendiente)
  },
  // IVA solo para compradores de Colombia (decisión de Fer): COP con IVA incluido; USD sin IVA para otros países.
  notaCop: "IVA incluido",

  // ── Bonos y comunidad (confirmados por Fer). Las URL se llenan cuando existan. ──
  // COPY PROVISIONAL / URL pendiente
  comunidad: {
    titulo: "Únete a la comunidad",
    texto: "Entra a la comunidad de alumnos ALMA en Skool: ahí están los avisos de la clínica en vivo mensual, las grabaciones y el grupo exclusivo para tus preguntas.",
    cta: "Entrar a la comunidad",
    skoolUrl: "",                // URL pendiente: link de invitación a la comunidad de Skool
    grupoUrl: "",                // URL pendiente: link del grupo exclusivo (opcional)
  },
  bonos: [
    ["Clínica ALMA en vivo", "1 sesión grupal al mes de 60 minutos, grabada. Fer revisa en vivo las landings y los paneles que manden los alumnos."],
    ["Grupo exclusivo de alumnos", "Un espacio para tus preguntas, moderado por el equipo de Conexión."],
    ["Comunidad ALMA en Skool", "Avisos, grabaciones de las clínicas y recursos en un solo lugar."],
    ["Biblioteca de prompts y kit de plantillas", "Todos los prompts del taller, los 3 agentes listos para pegar y las plantillas de cada módulo."],
  ] as [string, string][],

  // País del comprador → moneda: Colombia paga en COP (PSE, Nequi o tarjeta, IVA incluido); el resto en USD con tarjeta.
  paises: ["Colombia", "México", "Estados Unidos", "España", "Perú", "Chile", "Argentina", "Ecuador", "Guatemala", "Panamá", "República Dominicana", "Otro país"],

  // ── Hero ──
  eyebrow: "Taller ALMA · by Conexión",
  titular: { antes: "Dale", resaltado: "ALMA", despues: "a tu negocio con IA." },
  bajada: "Un taller corto y práctico en el que te guío paso a paso para crear, con Claude, tu arquetipo de marca, tus propios agentes, tu primera landing y un panel para ver tus números desde el celular.",
  bajoVideo: "Unas 2 horas y media en lecciones cortas · A tu ritmo · Desde el celular",
  cta: "Quiero entrar a ALMA",
  ctaFija: "ALMA · pago único",

  // Video de venta. Sube public/workshop-vsl.mp4 (16:9, H.264) y su portada, y cambia `listo` a true.
  video: { src: "/workshop-vsl.mp4", poster: "/workshop-vsl-poster.jpg", listo: false, titulo: "Dale ALMA a tu negocio con IA" },

  // ── El problema ──
  problema: {
    titulo: "Nadie te enseñó el sistema. Solo las piezas sueltas.",
    parrafos: [
      "Un tutorial de Reels por aquí, un truco de Canva por allá, un curso de anuncios que nunca terminaste. Y la IA abierta en el celular, dándote textos que suenan a cualquiera menos a ti.",
      "No te falta talento. Te falta un orden.",
    ],
  },

  // ── La solución ──
  solucion: {
    titulo: "ALMA son las cuatro piezas que vas a construir.",
    letras: [
      ["A", "de Arquetipo", "Descubres qué tipo de marca eres y qué contenido te toca hacer."],
      ["L", "de Landing", "Creas con Claude tu propia página y la publicas con tu link."],
      ["M", "de Marca", "Le das identidad, tu foto, tu video y tus creativos."],
      ["A", "de Agentes", "Armas tus propios asistentes de Claude que escriben con tu voz."],
    ] as [string, string, string][],
    cierre: "Y al final conectas todo a un panel que miras desde el celular.",
  },

  // ── Lo que te llevas ──
  teLlevas: [
    "Tu arquetipo de marca y 10 ideas de contenido que sí van contigo.",
    "Claude instalado y entendido: proyectos, archivos y artefactos, sin tecnicismos.",
    "3 agentes listos: estratega, guionista y redactor de tu landing.",
    "Tu primera landing publicada, con botón a WhatsApp.",
    "Tu mini manual de marca, un video de 60 segundos y 3 creativos.",
    "Tu panel en el celular con los 5 números que importan.",
    "La biblioteca de prompts y las plantillas para que lo repitas cuando quieras.",
  ],

  // ── Quién te guía ── (sin cifras de clientes hasta tener su permiso: dato pendiente #6)
  guia: {
    titulo: "Quién te guía",
    texto: "Soy Fernanda Conde y dirijo Conexión, un equipo Colombia–México que hace con IA, y con criterio humano, la marca, los videos, las landings y los paneles de otros negocios. Estudié cine, lideré lanzamientos y aprendí a construir de noche con Claude. En ALMA te enseño el mismo orden con el que trabajamos, en versión básica, para que lo hagas tú.",
    firma: "Fernanda Conde · Conexión",
  },

  // ── Para quién es / no es ──
  paraQuien: [
    "Tienes un servicio, un saber o una idea concreta que quieres mostrar con tu propia marca.",
    "Quieres usar la IA en serio, no como un buscador.",
    "Prefieres hacerlo tú, con guía, antes de contratar a alguien.",
    "Puedes dedicar unas 3 horas a la semana.",
  ],
  noEsPara: [
    "Buscas dinero fácil y sin esfuerzo. Esto requiere tu tiempo y tu implementación.",
    "Quieres que alguien lo haga por ti. Para eso está la implementación de Conexión.",
    "Esperas un curso avanzado de pauta o automatización. ALMA es la base; eso viene después.",
    "Esperas que la IA lo haga todo sin que revises nada.",
  ],

  // ── Precio ── (el número de lecciones y los meses de acceso salen de la base de datos)
  incluye: (p: { lecciones: number; meses: number | null; clinica: boolean; comunidad: boolean }) => [
    `${p.lecciones} lecciones.`,
    "Biblioteca de prompts.",
    "3 agentes listos para pegar.",
    "Kit de plantillas.",
    ...(p.clinica ? ["Clínica en vivo mensual."] : []),
    ...(p.comunidad ? ["Grupo exclusivo y comunidad en Skool."] : []),
    p.meses ? `${p.meses} meses de acceso con actualizaciones.` : "Acceso con actualizaciones.",
  ],
  garantia: "Garantía de 7 días: si no es para ti, te devolvemos el 100 %.",
  botonCop: "Pagar en pesos (PSE, Nequi o tarjeta)",
  botonUsd: "Pagar en dólares (tarjeta)",

  // ── Preguntas frecuentes ──
  faq: (p: { usd: string | null; clinica: boolean; abono: boolean }): [string, string][] => [
    ["¿Tengo que pagar Claude?", "Puedes empezar con el plan gratis. Para sacarle todo el jugo recomendamos Claude Pro (USD 20 al mes, se paga directamente a Anthropic). ALMA no incluye la suscripción a Claude."],
    ["¿Es en vivo?", p.clinica ? "Las lecciones son grabadas y las ves a tu ritmo. Una vez al mes hay una clínica en vivo, que queda grabada." : "Las lecciones son grabadas y las ves a tu ritmo."],
    ["¿Puedo hacerlo solo desde el celular?", "Sí, todo se ve desde el celular. Para publicar la landing es más cómodo un computador, pero no es obligatorio."],
    ["¿Necesito saber programar o diseñar?", "No. Claude escribe el código y tú das las instrucciones que te enseño."],
    ["¿Cuánto tiempo me toma?", "Unas 2 horas y media de video, más el tiempo de tus tareas. Recomendamos un módulo por semana."],
    ["¿Sirve para mi tipo de negocio?", "Sirve para servicios, marca personal y negocios pequeños. No está pensado para tiendas con catálogos grandes."],
    ["¿Cómo pago desde México?", `Con tarjeta, en dólares${p.usd ? ` (${p.usd})` : ""}. PSE y Nequi solo funcionan en pesos colombianos.`],
    ["¿Cuándo tengo acceso?", "Al confirmarse el pago recibes en tu correo tu usuario y contraseña."],
    ["¿Me van a garantizar clientes o ventas?", "No. Te garantizamos un método claro y las herramientas para construir tu sistema. Lo que pase después depende de tu oferta y de tu trabajo."],
    ["¿ALMA es de Anthropic?", "No. Es un taller independiente de Conexión que enseña a usar Claude."],
    ["¿Y si después quiero que lo hagan por mí?", p.abono ? "Conexión lo implementa. Si compras la implementación dentro de los 60 días siguientes, te abonamos lo que pagaste por ALMA." : "Conexión lo implementa. Aplica y revisamos si es para ti."],
  ],

  // ── Cierre y pie ──
  cierre: { titulo: "Si lo puedes imaginar, lo puedes crear.", texto: "ALMA es el primer paso. Lo demás lo construyes tú, con orden y con tu voz." },
  pie: "ALMA es un taller educativo independiente; no está afiliado a Anthropic. Los resultados dependen de la implementación de cada persona.",

  // Tarjeta "siguiente paso" al final del curso: las 5 preguntas de calificación de Conexión, con origen "alma".
  // COPY PROVISIONAL (el documento de producto define el CTA, no el texto de la tarjeta)
  siguientePaso: {
    titulo: "¿Prefieres que lo hagamos contigo?",
    texto: "ALMA es la versión básica del mismo orden con el que trabaja Conexión. Si quieres que el equipo implemente tu sistema completo, responde las 5 preguntas y revisamos si es para ti.",
    cta: "Responder las 5 preguntas",
    href: "/aplicar?utm_source=alma&utm_medium=curso&utm_campaign=cierre",
  },

  // WhatsApp de soporte para alumnos (solo dígitos, con indicativo). Vacío = no se muestra. Dato pendiente #10.
  soporteWhatsapp: "",
};

export const EVENTOS_WORKSHOP = ["workshop_vista", "workshop_cta", "workshop_checkout", "workshop_pago", "workshop_acceso"] as const;

// "USD 45" / "COP 179.000", como lo escribe el copy de ALMA.
export function precioTexto(monto: number | null | undefined, moneda: "USD" | "COP") {
  if (!monto) return null;
  return `${moneda} ${new Intl.NumberFormat("es-CO", { maximumFractionDigits: moneda === "COP" ? 0 : 2 }).format(monto)}`;
}

// "$179.000" para el número grande de la tarjeta de precio (la moneda va aparte).
export function precioNumero(monto: number | null | undefined) {
  if (!monto) return null;
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 }).format(monto)}`;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://conexionteam.app").replace(/\/$/, "");
}

export const monedaDePais = (pais: string): "COP" | "USD" => (pais === "Colombia" ? "COP" : "USD");

// Cookie con la inscripción de la última compra: la página de gracias la lee al volver de Bold.
export const COOKIE_INSCRIPCION = "cx-ws-insc";
