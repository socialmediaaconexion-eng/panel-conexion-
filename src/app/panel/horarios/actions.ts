"use server";

import { revalidatePath } from "next/cache";
import { requireSeller, esGestor } from "@/lib/auth";
import { mensajeError } from "@/lib/format";
import type { Estado } from "../leads/actions";

export async function agregarBloque(_prev: Estado, formData: FormData): Promise<Estado> {
  const { seller, supabase } = await requireSeller();
  const sellerId = String(formData.get("seller_id") || seller.id);
  if (sellerId !== seller.id && !esGestor(seller)) return { error: "Solo puedes editar tu propio horario." };
  const dia = Number(formData.get("dia_semana"));
  const inicio = String(formData.get("hora_inicio"));
  const fin = String(formData.get("hora_fin"));
  if (!(dia >= 0 && dia <= 6) || !inicio || !fin) return { error: "Completa día, hora de inicio y hora de fin." };
  if (fin <= inicio) return { error: "La hora de fin tiene que ser después de la de inicio." };
  const { error } = await supabase.from("horarios").insert({ seller_id: sellerId, dia_semana: dia, hora_inicio: inicio, hora_fin: fin });
  if (error) return { error: mensajeError(error)! };
  revalidatePath("/panel/horarios");
  return { ok: "Bloque agregado." };
}

export async function borrarBloque(id: string) {
  const { supabase } = await requireSeller();
  await supabase.from("horarios").delete().eq("id", id);
  revalidatePath("/panel/horarios");
}
