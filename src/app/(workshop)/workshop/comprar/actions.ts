"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearLinkBold, boldConfigurado } from "@/lib/bold";
import { WORKSHOP, COOKIE_INSCRIPCION, siteUrl, monedaDePais } from "@/lib/workshop";
import { esCorreoDelEquipo, registrarEventoWorkshop } from "@/lib/workshop-acceso";

// Compra del workshop: alumno + inscripción pendiente_pago + cobro + link de Bold → checkout de Bold.
// La activación llega después (cron /api/cron/workshop, página de gracias o panel) al ver el link pagado.
export async function comprarWorkshop(_prev: string | null, formData: FormData): Promise<string | null> {
  const t = (k: string, n = 200) => String(formData.get(k) ?? "").trim().slice(0, n);
  if (t("empresa_web")) return null; // trampa para bots
  const nombre = t("nombre", 120);
  const email = t("email", 160).toLowerCase();
  const whatsapp = t("whatsapp", 40);
  // El país decide el precio (decisión de Fer): Colombia → COP con IVA incluido (PSE, Nequi o tarjeta); resto → USD sin IVA.
  const pais = t("pais", 60);
  if (!WORKSHOP.paises.includes(pais)) return "Elige tu país para mostrarte el precio correcto.";
  if (!nombre || !email || !whatsapp) return "Completa tu nombre, tu correo y tu WhatsApp.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Ese correo no parece válido. Revísalo: ahí te llega el acceso.";
  if (whatsapp.replace(/\D/g, "").length < 10) return "Escribe tu WhatsApp con el indicativo del país (por ejemplo, +57 300 000 0000).";

  const admin = createAdminClient();
  const { data: curso } = await admin.from("cursos").select("id, titulo, precio_usd, precio_cop").eq("slug", WORKSHOP.slug).eq("activo", true).maybeSingle();
  if (!curso) return "El workshop no está disponible en este momento.";
  // Precio único USD 45 (decisión de Fer, 20-nov): solo se cobra en COP si el curso tiene precio_cop cargado.
  const moneda = monedaDePais(pais) === "COP" && Number(curso.precio_cop) > 0 ? "COP" : "USD";
  const monto = Number(moneda === "COP" ? curso.precio_cop : curso.precio_usd);
  if (!monto || monto <= 0) return moneda === "USD" ? "Por ahora el pago es solo en pesos colombianos." : "Por ahora el pago es solo en dólares.";
  if (await esCorreoDelEquipo(email, admin)) return "Ese correo pertenece al equipo de Conexión. Usa otro correo para comprar.";
  if (!boldConfigurado()) return "El pago en línea todavía no está habilitado. Escríbenos y te ayudamos a completar tu compra.";

  // Alumno por correo (sin duplicar): si ya existe, se conserva y se completa el WhatsApp si faltaba.
  const { data: existente } = await admin.from("alumnos").select("id, whatsapp").eq("email", email).maybeSingle();
  let alumnoId = existente?.id as string | undefined;
  if (!alumnoId) {
    const { data, error } = await admin.from("alumnos").insert({ nombre, email, whatsapp }).select("id").single();
    if (error || !data) return "No pudimos guardar tus datos. Intenta de nuevo en un momento.";
    alumnoId = data.id;
  } else if (!existente?.whatsapp) {
    await admin.from("alumnos").update({ whatsapp }).eq("id", alumnoId);
  }

  const rastreo = {
    sesion: t("sesion", 64) || null,
    utm_source: t("utm_source") || null, utm_medium: t("utm_medium") || null,
    utm_campaign: t("utm_campaign") || null, utm_content: t("utm_content") || null,
  };

  const { data: previa } = await admin.from("inscripciones").select("id, estado").eq("alumno_id", alumnoId).eq("curso_id", curso.id).maybeSingle();
  if (previa?.estado === "activa") redirect("/curso/login?e=ya-activo");

  const { data: cobro, error: eCobro } = await admin.from("cobros")
    .insert({ cliente_nombre: nombre, cliente_email: email, cliente_telefono: whatsapp, concepto: `${WORKSHOP.marca}${moneda === "COP" ? " (IVA incluido)" : ""}`, moneda, monto, estado: "borrador" })
    .select("id").single();
  if (eCobro || !cobro) return "No pudimos preparar tu pago. Intenta de nuevo en un momento.";

  let inscripcionId = previa?.id as string | undefined;
  const datos = { estado: "pendiente_pago", origen: "pago_bold", cobro_id: cobro.id, moneda, monto, pais, ...rastreo };
  if (inscripcionId) {
    // Una compra anterior sin pagar (o revocada) se reutiliza con el cobro nuevo.
    await admin.from("inscripciones").update(datos).eq("id", inscripcionId);
  } else {
    const { data, error } = await admin.from("inscripciones").insert({ alumno_id: alumnoId, curso_id: curso.id, ...datos }).select("id").single();
    if (error || !data) return "No pudimos preparar tu inscripción. Intenta de nuevo en un momento.";
    inscripcionId = data.id;
  }

  const r = await crearLinkBold({
    // La descripción la ve el comprador en el checkout de Bold: en COP aclara "IVA incluido".
    monto, moneda, descripcion: `${WORKSHOP.marca}${moneda === "COP" ? " · IVA incluido" : ""}`, referencia: `CXWS-${cobro.id.slice(0, 8)}`, email,
    venceDias: 2, callbackUrl: `${siteUrl()}/workshop/gracias`,
  });
  if (!r.ok) {
    await admin.from("cobros").update({ error: r.error }).eq("id", cobro.id);
    return "No pudimos abrir el pago con Bold. Intenta de nuevo en unos minutos.";
  }
  await admin.from("cobros").update({ bold_link: r.link, url: r.url, estado: "pendiente", error: null }).eq("id", cobro.id);
  await registrarEventoWorkshop("workshop_checkout", rastreo, admin);

  // La página de gracias sabe qué inscripción mostrar aunque Bold no devuelva parámetros.
  (await cookies()).set(COOKIE_INSCRIPCION, inscripcionId!, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 14 * 86400 });
  redirect(r.url);
}
