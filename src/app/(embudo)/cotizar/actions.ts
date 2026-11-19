"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { enviarAN8n } from "@/lib/n8n";
import { PIEZAS } from "@/lib/cotizaciones";

const txt = (f: FormData, k: string, n = 300) => String(f.get(k) ?? "").trim().slice(0, n);

export async function crearCotizacion(_prev: string | null, formData: FormData): Promise<string | null> {
  if (txt(formData, "empresa_web")) redirect("/cotizar/enviada"); // trampa para bots
  const nombre = txt(formData, "nombre", 120);
  const email = txt(formData, "email", 160).toLowerCase();
  const piezas = formData.getAll("piezas").map(String).filter((p) => PIEZAS.includes(p));
  if (!nombre || !email) return "Escribe tu nombre y tu correo.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Ese correo no parece válido.";
  if (piezas.length === 0) return "Elige al menos una pieza para cotizar.";

  const fila = {
    nombre, email, piezas,
    telefono: txt(formData, "telefono", 40) || null,
    empresa: txt(formData, "empresa", 160) || null,
    pais: txt(formData, "pais", 80) || null,
    presupuesto: txt(formData, "presupuesto", 80) || null,
    plazo: txt(formData, "plazo", 80) || null,
    mensaje: txt(formData, "mensaje", 2000) || null,
    utm_source: txt(formData, "utm_source", 200) || null,
    utm_campaign: txt(formData, "utm_campaign", 200) || null,
    sesion: txt(formData, "sesion", 64) || null,
  };

  const admin = createAdminClient();
  const { data, error } = await admin.from("cotizaciones").insert(fila).select("id, created_at").single();
  if (error) return "No pudimos guardar tu solicitud. Intenta de nuevo en un momento.";

  const estado = await enviarAN8n(process.env.N8N_COTIZACIONES_WEBHOOK, {
    tipo: "cotizacion",
    id: data.id,
    fecha: data.created_at,
    ...fila,
    panel_url: "https://conexionteam.app/panel/cotizaciones",
  });
  await admin.from("cotizaciones").update({ n8n_estado: estado }).eq("id", data.id);
  redirect("/cotizar/enviada");
}
