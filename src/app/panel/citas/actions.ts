"use server";

import { revalidatePath } from "next/cache";
import { requireSeller, esGestor, type Seller } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mensajeError } from "@/lib/format";
import type { Estado } from "../leads/actions";

// Colombia has no daylight saving time: a fixed -05:00 offset is exact year-round.
const OFFSET = "-05:00";
const ESTADOS = ["agendada", "reagendada", "atendida", "no_asistio", "cancelada"] as const;

function parseInicio(formData: FormData) {
  const local = String(formData.get("inicio") ?? "");
  const minutos = Number(formData.get("duracion") ?? 45);
  if (!local || !Number.isFinite(minutos) || minutos < 15 || minutos > 240) return null;
  const start = new Date(`${local}:00${OFFSET}`);
  if (Number.isNaN(start.getTime())) return null;
  return { start, end: new Date(start.getTime() + minutos * 60_000) };
}

// Day of week and HH:MM in Bogotá for a UTC instant.
function enBogota(d: Date) {
  const local = new Date(d.getTime() - 5 * 3600_000);
  return { dia: local.getUTCDay(), hhmm: local.toISOString().slice(11, 16) };
}

// True when the seller has no schedule configured (no restriction) or the slot fits inside one block.
async function cubreHorario(admin: ReturnType<typeof createAdminClient>, sellerId: string, start: Date, end: Date) {
  const { data: bloques } = await admin.from("horarios").select("dia_semana, hora_inicio, hora_fin").eq("seller_id", sellerId);
  if (!bloques || bloques.length === 0) return true;
  const a = enBogota(start), b = enBogota(end);
  if (a.dia !== b.dia) return false;
  return bloques.some((h) => h.dia_semana === a.dia && h.hora_inicio.slice(0, 5) <= a.hhmm && h.hora_fin.slice(0, 5) >= b.hhmm);
}

async function libre(admin: ReturnType<typeof createAdminClient>, sellerId: string, start: Date, end: Date, excluirCita?: string) {
  let q = admin.from("citas").select("id").eq("seller_id", sellerId).in("estado", ["agendada", "reagendada"])
    .lt("start_at", end.toISOString()).gt("end_at", start.toISOString());
  if (excluirCita) q = q.neq("id", excluirCita);
  const { data } = await q;
  return (data ?? []).length === 0;
}

export async function agendarCita(leadId: string, _prev: Estado, formData: FormData): Promise<Estado> {
  const { seller } = await requireSeller();
  const admin = createAdminClient();
  const slot = parseInicio(formData);
  if (!slot) return { error: "Elige fecha, hora y una duración entre 15 y 240 minutos." };
  if (slot.start.getTime() < Date.now()) return { error: "No se puede agendar en una hora que ya pasó." };

  const { data: asignacion } = await admin.from("lead_assignments").select("seller_id, sellers(*)").eq("lead_id", leadId).eq("activo", true).maybeSingle();
  const dueno = (Array.isArray(asignacion?.sellers) ? asignacion?.sellers[0] : asignacion?.sellers) as Seller | undefined;
  if (dueno && dueno.id !== seller.id && !esGestor(seller)) return { error: "Este lead es de otro vendedor." };

  // Setter: the appointment goes to an available closer, and lead ownership moves with it.
  let closerId = dueno?.tipo === "closer" ? dueno.id : null;
  if (!closerId) {
    const { data: closers } = await admin.from("sellers").select("id").eq("activo", true).eq("rol", "vendedor").eq("tipo", "closer");
    for (const c of closers ?? []) {
      if ((await cubreHorario(admin, c.id, slot.start, slot.end)) && (await libre(admin, c.id, slot.start, slot.end))) { closerId = c.id; break; }
    }
    if (!closerId) return { error: "Ningún closer tiene ese horario libre. Prueba otra hora." };
  } else {
    if (!(await cubreHorario(admin, closerId, slot.start, slot.end))) return { error: "Esa hora está fuera del horario de trabajo del closer." };
    if (!(await libre(admin, closerId, slot.start, slot.end))) return { error: "Ese horario choca con otra cita activa del closer." };
  }

  const { error } = await admin.from("citas").insert({
    lead_id: leadId, seller_id: closerId, start_at: slot.start.toISOString(), end_at: slot.end.toISOString(),
    notas: String(formData.get("notas") ?? "").trim() || null,
  });
  if (error) return { error: mensajeError(error)! };

  if (dueno?.id !== closerId) {
    await admin.from("lead_assignments").update({ activo: false }).eq("lead_id", leadId).eq("activo", true);
    await admin.from("lead_assignments").insert({ lead_id: leadId, seller_id: closerId, assigned_by: seller.id, motivo: dueno ? "handoff_setter_closer" : "manual" });
  }
  await admin.from("leads").update({ etapa: "agendado" }).eq("id", leadId).in("etapa", ["nuevo", "contactado"]);

  revalidatePath(`/panel/leads/${leadId}`);
  revalidatePath("/panel/citas");
  return { ok: dueno?.id === closerId ? "Cita agendada." : "Cita agendada con un closer disponible; el lead pasó a ese closer." };
}

export async function reagendarCita(citaId: string, _prev: Estado, formData: FormData): Promise<Estado> {
  const { seller, supabase } = await requireSeller();
  const admin = createAdminClient();
  const slot = parseInicio(formData);
  if (!slot) return { error: "Elige fecha, hora y duración." };
  if (slot.start.getTime() < Date.now()) return { error: "La nueva hora ya pasó." };

  // RLS on the user client decides whether this seller may touch the appointment.
  const { data: cita } = await supabase.from("citas").select("id, seller_id, lead_id, estado").eq("id", citaId).maybeSingle();
  if (!cita) return { error: "No encontré esa cita o no tienes permiso sobre ella." };
  if (!["agendada", "reagendada"].includes(cita.estado)) return { error: "Solo se reagendan citas activas. Para una cita vencida, agenda una nueva." };
  if (cita.seller_id !== seller.id && !esGestor(seller)) return { error: "Esta cita es de otro vendedor." };
  if (!(await cubreHorario(admin, cita.seller_id, slot.start, slot.end))) return { error: "Esa hora está fuera del horario de trabajo del closer." };
  if (!(await libre(admin, cita.seller_id, slot.start, slot.end, citaId))) return { error: "Ese horario choca con otra cita activa del closer." };

  const { error } = await supabase.from("citas").update({ start_at: slot.start.toISOString(), end_at: slot.end.toISOString(), estado: "reagendada" }).eq("id", citaId);
  if (error) return { error: mensajeError(error)! };
  revalidatePath("/panel/citas");
  revalidatePath(`/panel/leads/${cita.lead_id}`);
  return { ok: "Cita reagendada." };
}

export async function cambiarEstadoCita(citaId: string, formData: FormData) {
  const { supabase } = await requireSeller();
  const estado = String(formData.get("estado"));
  if (!ESTADOS.includes(estado as (typeof ESTADOS)[number])) return;
  const { data } = await supabase.from("citas").update({ estado }).eq("id", citaId).select("lead_id").maybeSingle();
  revalidatePath("/panel/citas");
  if (data) revalidatePath(`/panel/leads/${data.lead_id}`);
}
