import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Colombia has no daylight saving time: UTC-5 year-round.
const OFFSET_MS = 5 * 3600_000;
export const DURACION_LLAMADA_MIN = 45;

// Signed link token so an applicant can book only their own call without logging in.
export function firmarLead(leadId: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!).update(leadId).digest("hex").slice(0, 32);
}
export function verificarLead(leadId: string, token: string) {
  const esperado = Buffer.from(firmarLead(leadId));
  const dado = Buffer.from(token ?? "");
  return esperado.length === dado.length && timingSafeEqual(esperado, dado);
}

type Bloque = { seller_id: string; dia_semana: number; hora_inicio: string; hora_fin: string };
type Ocupada = { seller_id: string; start_at: string; end_at: string };

// Bogotá wall-clock (date + "HH:MM") → UTC instant.
function instante(fechaBogota: Date, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(fechaBogota.getUTCFullYear(), fechaBogota.getUTCMonth(), fechaBogota.getUTCDate(), h, m) + OFFSET_MS);
}

// Bookable slots for the next `dias` days: a slot is free if at least one active closer has it inside
// their schedule and has no overlapping active appointment. Returns slot start → list of free closers.
export async function slotsDisponibles(dias = 7) {
  const admin = createAdminClient();
  const { data: closers } = await admin.from("sellers").select("id").eq("activo", true).eq("rol", "vendedor").eq("tipo", "closer");
  const ids = (closers ?? []).map((c) => c.id);
  if (ids.length === 0) return new Map<string, string[]>();

  const ahora = new Date();
  const hasta = new Date(ahora.getTime() + dias * 86400_000);
  const [{ data: bloques }, { data: ocupadas }] = await Promise.all([
    admin.from("horarios").select("seller_id, dia_semana, hora_inicio, hora_fin").in("seller_id", ids),
    admin.from("citas").select("seller_id, start_at, end_at").in("seller_id", ids).in("estado", ["agendada", "reagendada"]).lt("start_at", hasta.toISOString()).gt("end_at", ahora.toISOString()),
  ]);

  const slots = new Map<string, string[]>();
  const minimo = ahora.getTime() + 2 * 3600_000; // at least 2h notice
  const hoyBogota = new Date(ahora.getTime() - OFFSET_MS);

  for (let d = 0; d < dias; d++) {
    const dia = new Date(Date.UTC(hoyBogota.getUTCFullYear(), hoyBogota.getUTCMonth(), hoyBogota.getUTCDate() + d));
    for (const b of (bloques ?? []) as Bloque[]) {
      if (b.dia_semana !== dia.getUTCDay()) continue;
      const finBloque = instante(dia, b.hora_fin.slice(0, 5)).getTime();
      for (let t = instante(dia, b.hora_inicio.slice(0, 5)).getTime(); t + DURACION_LLAMADA_MIN * 60_000 <= finBloque; t += 30 * 60_000) {
        if (t < minimo) continue;
        const fin = t + DURACION_LLAMADA_MIN * 60_000;
        const choca = ((ocupadas ?? []) as Ocupada[]).some((o) => o.seller_id === b.seller_id && new Date(o.start_at).getTime() < fin && new Date(o.end_at).getTime() > t);
        if (choca) continue;
        const key = new Date(t).toISOString();
        const lista = slots.get(key) ?? [];
        if (!lista.includes(b.seller_id)) lista.push(b.seller_id);
        slots.set(key, lista);
      }
    }
  }
  return new Map([...slots.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
