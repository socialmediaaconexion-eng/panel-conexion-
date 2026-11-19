"use server";

import { revalidatePath } from "next/cache";
import { requireSeller } from "@/lib/auth";
import { mensajeError } from "@/lib/format";
import type { Estado } from "../leads/actions";

const ESTADOS = ["abierto", "en_progreso", "cerrado"];
const PRIORIDADES = ["baja", "media", "alta"];

export async function crearTicket(_prev: Estado, formData: FormData): Promise<Estado> {
  const { seller, supabase } = await requireSeller();
  const asunto = String(formData.get("asunto") ?? "").trim();
  const prioridad = String(formData.get("prioridad") ?? "media");
  if (!asunto) return { error: "Escribe un asunto." };
  if (!PRIORIDADES.includes(prioridad)) return { error: "Prioridad no válida." };
  const asignado = String(formData.get("asignado_a") ?? "");
  const { error } = await supabase.from("tickets").insert({
    asunto, prioridad,
    descripcion: String(formData.get("descripcion") ?? "").trim() || null,
    asignado_a: asignado || null,
    creado_por: seller.id,
  });
  if (error) return { error: mensajeError(error)! };
  revalidatePath("/panel/soporte");
  return { ok: "Ticket creado." };
}

export async function actualizarTicket(id: string, formData: FormData) {
  const { supabase } = await requireSeller();
  const estado = String(formData.get("estado"));
  const asignado = String(formData.get("asignado_a") ?? "");
  if (!ESTADOS.includes(estado)) return;
  await supabase.from("tickets").update({ estado, asignado_a: asignado || null }).eq("id", id);
  revalidatePath("/panel/soporte");
}
