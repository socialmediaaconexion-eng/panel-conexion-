"use server";

import { requireAlumno } from "@/lib/alumno";

type Estado = { error?: string; ok?: string } | null;

// Cambia la contraseña del alumno con sesión abierta (también después del enlace de "Olvidé mi contraseña").
export async function cambiarClave(_prev: Estado, formData: FormData): Promise<Estado> {
  const { supabase } = await requireAlumno();
  const clave = String(formData.get("clave") ?? "");
  const repetir = String(formData.get("repetir") ?? "");
  if (clave.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (clave !== repetir) return { error: "Las dos contraseñas no coinciden." };
  const { error } = await supabase.auth.updateUser({ password: clave });
  if (error) return { error: error.message.includes("different") ? "Usa una contraseña distinta a la anterior." : "No se pudo cambiar la contraseña. Intenta de nuevo." };
  return { ok: "Listo, tu contraseña quedó cambiada." };
}
