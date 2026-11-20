import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { crearLinkBold, boldConfigurado } from "@/lib/bold";
import { PAGOS, type PlanId } from "@/lib/planes";

// Botón "Pagar" de /planes: crea un link de pago de Bold por el plan y redirige al checkout.
// Sin Bold conectado, lleva a /cotizar para que el equipo envíe el link manualmente.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const plan = url.searchParams.get("plan") as PlanId | null;
  const p = plan ? PAGOS[plan] : null;
  if (!p) return NextResponse.redirect(new URL("/planes", url), 303);
  if (!boldConfigurado()) return NextResponse.redirect(new URL(`/cotizar?plan=${plan}`, url), 303);

  const admin = createAdminClient();
  const { data: cobro } = await admin.from("cobros")
    .insert({ cliente_nombre: "Pago web /planes", concepto: p.concepto, moneda: "USD", monto: p.monto, estado: "borrador" })
    .select("id").single();
  const r = await crearLinkBold({ monto: p.monto, moneda: "USD", descripcion: p.concepto, referencia: `CXW-${cobro?.id?.slice(0, 8) ?? Date.now()}` });
  if (!r.ok) {
    if (cobro) await admin.from("cobros").update({ error: r.error }).eq("id", cobro.id);
    return NextResponse.redirect(new URL(`/cotizar?plan=${plan}`, url), 303);
  }
  if (cobro) await admin.from("cobros").update({ bold_link: r.link, url: r.url, estado: "pendiente" }).eq("id", cobro.id);
  return NextResponse.redirect(r.url, 303);
}
