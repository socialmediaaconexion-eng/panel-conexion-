"use server";

import { revalidatePath } from "next/cache";
import { requireGestor } from "@/lib/auth";
import { ESTADOS_COTIZACION } from "@/lib/cotizaciones";

export async function actualizarCotizacion(id: string, formData: FormData) {
  const { supabase } = await requireGestor();
  const estado = String(formData.get("estado") ?? "");
  const notas = String(formData.get("notas") ?? "").slice(0, 2000);
  if (!(estado in ESTADOS_COTIZACION)) return;
  await supabase.from("cotizaciones").update({ estado, notas: notas || null }).eq("id", id);
  revalidatePath("/panel/cotizaciones");
}
