"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { mensajeError } from "@/lib/format";
import type { Estado } from "../leads/actions";

const ROLES = ["admin", "manager", "vendedor"];
const TIPOS = ["closer", "setter"];

export async function agregarMiembro(_prev: Estado, formData: FormData): Promise<Estado> {
  await requireAdmin();
  const admin = createAdminClient();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const rol = String(formData.get("rol"));
  const tipo = String(formData.get("tipo"));
  if (!nombre || !email) return { error: "Nombre y correo son obligatorios." };
  if (password.length < 8) return { error: "La contraseña inicial necesita al menos 8 caracteres." };
  if (!ROLES.includes(rol) || !TIPOS.includes(tipo)) return { error: "Rol o tipo no válido." };

  const { data: creado, error: authError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (authError) {
    return { error: authError.message.includes("already") ? "Ya existe un usuario con ese correo." : "No se pudo crear el acceso: " + authError.message };
  }
  const { error } = await admin.from("sellers").insert({
    user_id: creado.user.id, nombre, email, rol, tipo,
    whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
    es_asignador: formData.get("es_asignador") === "on",
  });
  if (error) {
    await admin.auth.admin.deleteUser(creado.user.id);
    return { error: mensajeError(error)! };
  }
  revalidatePath("/panel/equipo");
  return { ok: `${nombre} ya puede entrar con ${email} y la contraseña que le asignaste.` };
}

export async function actualizarMiembro(id: string, formData: FormData) {
  const { seller } = await requireAdmin();
  const admin = createAdminClient();
  const rol = String(formData.get("rol"));
  const tipo = String(formData.get("tipo"));
  if (!ROLES.includes(rol) || !TIPOS.includes(tipo)) return;
  const activo = formData.get("activo") === "on";
  // An admin can't demote or deactivate themselves (would lock everyone out if they're the only admin).
  if (id === seller.id && (rol !== "admin" || !activo)) return;
  await admin.from("sellers").update({ rol, tipo, activo, es_asignador: formData.get("es_asignador") === "on" }).eq("id", id);
  revalidatePath("/panel/equipo");
}
