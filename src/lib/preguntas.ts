// Preguntas de calificación del embudo: pocas, estratégicas y de un toque.
// Cada una filtra algo que el closer necesita saber antes de la llamada.
export const PREGUNTAS = [
  {
    id: "vende",
    titulo: "¿Qué vendes hoy?",
    ayuda: "Así preparamos ejemplos de tu mismo tipo de negocio.",
    opciones: ["Servicios o consultas", "Cursos, programas o mentorías", "Productos físicos", "Salud o bienestar", "Otro"],
  },
  {
    id: "freno",
    titulo: "¿Qué te frena más ahora mismo?",
    ayuda: "Elige la que más te duele.",
    opciones: ["No me llegan suficientes clientes", "Me llegan, pero no compran", "No tengo tiempo para dar seguimiento", "Mi marca no se ve tan profesional como soy", "Pago anuncios y no sé qué funciona"],
  },
  {
    id: "facturacion",
    titulo: "¿Cuánto factura tu negocio al mes?",
    ayuda: "Aproximado, en dólares. Nos dice qué sistema tiene sentido para ti.",
    opciones: ["Todavía no facturo", "Menos de $2.000", "$2.000 – $10.000", "Más de $10.000"],
  },
  {
    id: "inversion",
    titulo: "Si somos para ti, ¿cuánto podrías invertir en tu sistema?",
    ayuda: "Sin compromiso: es para proponerte algo que puedas sostener.",
    opciones: ["Menos de $500", "$500 – $1.500", "$1.500 – $5.000", "Más de $5.000"],
  },
  {
    id: "cuando",
    titulo: "¿Cuándo quieres empezar?",
    ayuda: "Abrimos pocas plazas al mes.",
    opciones: ["Lo antes posible", "En el próximo mes", "En 2–3 meses", "Solo estoy explorando"],
  },
] as const;

export type Calificacion = "viable" | "asesoria";

// Respuesta inmediata: viable si ya factura, puede invertir al menos $500 y no está "solo explorando".
// Si no, se le regala una asesoría de 20 minutos (el closer decide si ofrecerle la opción de aprender).
export function calificar(r: Record<string, string>): Calificacion {
  if (r.facturacion === "Todavía no facturo") return "asesoria";
  if (r.inversion === "Menos de $500") return "asesoria";
  if (r.cuando === "Solo estoy explorando") return "asesoria";
  return "viable";
}

export const DURACION_POR_CALIFICACION: Record<Calificacion, number> = { viable: 45, asesoria: 20 };

// Etiquetas para mostrar las respuestas en el panel (incluye las del formulario anterior).
export const ETIQUETAS_RESPUESTA: Record<string, string> = {
  vende: "Qué vende",
  freno: "Qué le frena",
  facturacion: "Facturación mensual",
  inversion: "Inversión posible",
  cuando: "Cuándo empezar",
  negocio: "Negocio",
  necesidad: "Necesita",
};
