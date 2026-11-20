"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Estado = { error?: string; ok?: string } | null;

async function origen() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return host ? `${proto}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || "https://conexionteam.app");
}

// Login del alumno. Solo deja la sesión abierta si la cuenta está en `alumnos` (nunca una cuenta del equipo).
export async function entrarCurso(_prev: Estado, formData: FormData): Promise<Estado> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Correo o contraseña incorrectos." };

  const { data: alumno } = await supabase.from("alumnos").select("id").eq("user_id", data.user.id).maybeSingle();
  if (!alumno) {
    const { data: seller } = await createAdminClient().from("sellers").select("id").eq("user_id", data.user.id).limit(1);
    await supabase.auth.signOut();
    return { error: seller?.length ? "Esta cuenta es del equipo de Conexión. El panel se abre en conexionteam.app/login." : "Este correo todavía no tiene un curso activo." };
  }
  redirect("/curso");
}

// "Olvidé mi contraseña": flujo de Supabase. Solo se envía a alumnos con acceso (no a cuentas del equipo),
// y la respuesta es la misma exista o no el correo.
export async function recuperarClave(_prev: Estado, formData: FormData): Promise<Estado> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Escribe el correo con el que compraste." };
  const { data: alumno } = await createAdminClient().from("alumnos").select("user_id").eq("email", email).maybeSingle();
  if (alumno?.user_id) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${await origen()}/curso/auth/confirmar?next=/curso/nueva-clave` });
  }
  return { ok: "Si ese correo tiene un curso, te llega un enlace para crear una contraseña nueva. Revisa también spam." };
}

export async function salirCurso() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/curso/login");
}
