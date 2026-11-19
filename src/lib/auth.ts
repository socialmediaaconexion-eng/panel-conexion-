import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Seller = {
  id: string;
  user_id: string | null;
  nombre: string;
  email: string;
  whatsapp: string | null;
  link_reunion: string | null;
  rol: "admin" | "manager" | "vendedor";
  tipo: "closer" | "setter";
  es_asignador: boolean;
  activo: boolean;
};

export function esGestor(s: Seller) {
  return s.rol === "admin" || s.rol === "manager" || s.es_asignador;
}

// Returns the logged-in team member, or sends them to /login (no session) or /sin-acceso (not on the team).
export async function requireSeller(): Promise<{ seller: Seller; supabase: Awaited<ReturnType<typeof createClient>> }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: seller } = await supabase
    .from("sellers")
    .select("*")
    .eq("user_id", user.id)
    .eq("activo", true)
    .maybeSingle<Seller>();
  if (!seller) redirect("/sin-acceso");
  return { seller, supabase };
}

export async function requireGestor() {
  const ctx = await requireSeller();
  if (!esGestor(ctx.seller)) redirect("/panel");
  return ctx;
}

export async function requireAdmin() {
  const ctx = await requireSeller();
  if (ctx.seller.rol !== "admin") redirect("/panel");
  return ctx;
}
