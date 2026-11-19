const TZ = "America/Bogota";
const BOGOTA_OFFSET_MS = 5 * 3600_000; // Colombia has no daylight saving time

// Midnight in Bogotá, `diasAtras` days ago, as a UTC instant — independent of the server's timezone.
export function inicioDiaBogota(diasAtras = 0) {
  const local = new Date(Date.now() - BOGOTA_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - diasAtras) + BOGOTA_OFFSET_MS);
}

export function inicioMesBogota() {
  const local = new Date(Date.now() - BOGOTA_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) + BOGOTA_OFFSET_MS);
}

export function fechaHora(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: TZ }).format(new Date(iso));
}

export function fecha(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: TZ }).format(new Date(iso));
}

export function dinero(monto: number, moneda = "USD") {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, maximumFractionDigits: 2 }).format(monto);
}

export function waLink(telefono: string | null, texto: string) {
  if (!telefono) return null;
  const digits = telefono.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(texto)}`;
}

// Maps database errors to Spanish messages a non-technical seller can act on.
export function mensajeError(error: { code?: string; message: string } | null): string | null {
  if (!error) return null;
  if (error.code === "P0001") return error.message; // RAISE EXCEPTION already written in Spanish
  if (error.code === "23505") return "Ese registro ya existe (por ejemplo, el mismo correo en el mismo embudo).";
  if (error.code === "23P01") return "Ese horario choca con otra cita activa del mismo vendedor.";
  if (error.code === "23514") return "Algún dato no es válido (revisa montos y fechas).";
  if (error.code === "42501") return "No tienes permiso para hacer esto.";
  return "No se pudo guardar. Intenta de nuevo o avisa al administrador.";
}

export const ETAPAS = ["nuevo", "contactado", "agendado", "en_proceso_de_pago", "cliente", "perdido", "lead_falso"] as const;
export const ETAPA_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  agendado: "Agendado",
  en_proceso_de_pago: "En proceso de pago",
  cliente: "Cliente",
  perdido: "Perdido",
  lead_falso: "Lead falso",
};
export const ESTADO_CITA_LABEL: Record<string, string> = {
  agendada: "Agendada",
  reagendada: "Reagendada",
  atendida: "Atendida",
  no_asistio: "No asistió",
  cancelada: "Cancelada",
};
export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
