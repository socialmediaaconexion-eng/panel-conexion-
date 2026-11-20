import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificarInscripcion } from "@/lib/workshop-acceso";
import { WORKSHOP, COOKIE_INSCRIPCION } from "@/lib/workshop";
import { Refrescar } from "./refrescar";

export const metadata: Metadata = { title: "Tu compra — Conexión", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ i?: string }> };

const ocultar = (e: string) => e.replace(/^(.{2}).*(@.*)$/, "$1•••$2");

// Bold vuelve aquí después del checkout (callback_url). Consulta el estado del link y, si ya está pagado,
// activa la inscripción y envía el acceso en ese mismo momento (el cron hace lo mismo por si nadie vuelve).
export default async function GraciasWorkshop({ searchParams }: Props) {
  const { i } = await searchParams;
  const id = i || (await cookies()).get(COOKIE_INSCRIPCION)?.value || "";
  const valido = /^[0-9a-f-]{36}$/i.test(id);
  const estado = valido ? await verificarInscripcion(id) : null;
  let email = "";
  if (estado) {
    const { data } = await createAdminClient().from("inscripciones").select("alumnos(email)").eq("id", id).maybeSingle();
    const a = Array.isArray(data?.alumnos) ? data?.alumnos[0] : data?.alumnos;
    email = (a as { email?: string } | null)?.email ?? "";
  }
  const soporte = WORKSHOP.soporteWhatsapp ? `https://wa.me/${WORKSHOP.soporteWhatsapp}` : null;

  // COPY PROVISIONAL (todos los estados)
  if (estado?.estado === "activa") {
    return (
      <main className="typ">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
        <span className="typ-check" aria-hidden="true">✓</span>
        <h1 className="lp-h2">¡Listo! Ya tienes acceso</h1>
        <p className="lp-lead">Te enviamos tu usuario y tu contraseña a <strong>{ocultar(email)}</strong>. Revisa también la carpeta de spam o promociones.</p>
        <Link href="/curso/login" className="btn btn-big">Entrar a mi curso</Link>
        {soporte && <p className="muted small">¿No te llegó el correo? <a href={soporte}>Escríbenos por WhatsApp</a></p>}
      </main>
    );
  }

  const fallo = estado?.pago && ["rechazado", "cancelado", "expirado"].includes(estado.pago);
  if (fallo) {
    return (
      <main className="typ">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
        <h1 className="lp-h2">El pago no se completó</h1>
        <p className="lp-lead">Bold nos reporta el pago como {estado!.pago}. No se hizo ningún cobro. Puedes intentarlo de nuevo con otro medio de pago.</p>
        <Link href="/workshop/comprar" className="btn btn-big">Intentar de nuevo</Link>
      </main>
    );
  }

  if (estado) {
    return (
      <main className="typ">
        <Refrescar />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
        <span className="ws-espera" aria-hidden="true" />
        <h1 className="lp-h2">Estamos confirmando tu pago</h1>
        <p className="lp-lead">Bold está procesando el pago. Apenas se confirme, te llega el acceso a <strong>{ocultar(email)}</strong>. Esta página se actualiza sola.</p>
        <p className="muted small">Con PSE la confirmación puede tardar unos minutos. Puedes cerrar esta página: el acceso te llega igual al correo.</p>
      </main>
    );
  }

  return (
    <main className="typ">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
      <h1 className="lp-h2">Gracias por tu compra</h1>
      <p className="lp-lead">Cuando Bold confirme el pago, te llega tu usuario y tu contraseña al correo que registraste.</p>
      <Link href="/curso/login" className="btn btn-big">Entrar a mi curso</Link>
    </main>
  );
}
