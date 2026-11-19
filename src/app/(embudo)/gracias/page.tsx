import Link from "next/link";
import { verificarLead, DURACION_LLAMADA_MIN } from "@/lib/agenda";
import { createAdminClient } from "@/lib/supabase/admin";
import { waLink } from "@/lib/format";

export const metadata = { title: "Llamada confirmada — Conexión" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ lead?: string; t?: string }> };

const cuando = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });

type CitaConfirmada = { start_at: string; sellers: { nombre: string; whatsapp: string | null; link_reunion: string | null } | null };

// Formato de fecha de Google Calendar: 20261120T150000Z
const gcal = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export default async function GraciasPage({ searchParams }: Props) {
  const { lead, t } = await searchParams;
  let cita: CitaConfirmada | null = null;
  let nombre = "";
  if (lead && t && verificarLead(lead, t)) {
    const admin = createAdminClient();
    const [{ data: c }, { data: l }] = await Promise.all([
      admin.from("citas").select("start_at, sellers(nombre, whatsapp, link_reunion)").eq("lead_id", lead).in("estado", ["agendada", "reagendada"]).order("start_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("leads").select("nombre").eq("id", lead).maybeSingle(),
    ]);
    cita = c as CitaConfirmada | null;
    nombre = l?.nombre?.split(" ")[0] ?? "";
  }

  const closer = cita?.sellers;
  const wa = closer ? waLink(closer.whatsapp, `Hola ${closer.nombre}, soy ${nombre}. Agendé una llamada con Conexión.`) : null;
  let calendario: string | null = null;
  if (cita) {
    const ini = new Date(cita.start_at);
    const fin = new Date(ini.getTime() + DURACION_LLAMADA_MIN * 60_000);
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: "Llamada con Conexión",
      dates: `${gcal(ini)}/${gcal(fin)}`,
      details: `Llamada de diagnóstico de ${DURACION_LLAMADA_MIN} minutos${closer ? ` con ${closer.nombre}` : ""}.${closer?.link_reunion ? `\nVideollamada: ${closer.link_reunion}` : ""}`,
      location: closer?.link_reunion ?? "Videollamada",
    });
    calendario = `https://calendar.google.com/calendar/render?${q}`;
  }

  return (
    <main className="typ">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      {cita ? (
        <>
          <span className="typ-check" aria-hidden="true">✓</span>
          <p className="eyebrow">Paso 2 de 2 · listo</p>
          <h1 className="lp-h2">{`${nombre ? `${nombre}, tu` : "Tu"} llamada quedó agendada`}</h1>
          <div className="typ-cita">
            <strong>{cuando.format(new Date(cita.start_at))}</strong>
            <span>Hora de Colombia · {DURACION_LLAMADA_MIN} minutos{closer ? ` · con ${closer.nombre}` : ""}</span>
            {closer?.link_reunion && <a href={closer.link_reunion} target="_blank" rel="noopener">Enlace de la videollamada</a>}
          </div>
          <div className="row" style={{ justifyContent: "center" }}>
            {calendario && <a className="btn btn-big" href={calendario} target="_blank" rel="noopener">Agregar a mi calendario</a>}
            {wa && <a className="btn ghost-btn" href={wa} target="_blank" rel="noopener">Escribirle a {closer!.nombre}</a>}
          </div>

          <h2 className="typ-h">Para aprovechar los 45 minutos</h2>
          <ol className="typ-pasos">
            <li><b>1</b><span><strong>Conéctate desde un computador</strong> y un lugar tranquilo, con cámara si puedes.</span></li>
            <li><b>2</b><span><strong>Ten a mano 2 o 3 marcas o páginas</strong> que te gusten: nos ayudan a entender lo que buscas.</span></li>
            <li><b>3</b><span><strong>Piensa en tu meta de los próximos meses</strong>: cuántos clientes quieres y qué te frena hoy.</span></li>
          </ol>
          <p className="muted small">
            {process.env.RESEND_API_KEY ? "También te enviamos la confirmación a tu correo. " : ""}
            Si necesitas cambiar el horario, escríbenos por WhatsApp.
          </p>
        </>
      ) : (
        <>
          <h1 className="lp-h2">Gracias por aplicar</h1>
          <p className="lp-lead">Recibimos tu información. Te contactaremos por WhatsApp para coordinar tu llamada.</p>
          <Link href="/vsl" className="btn">Volver al inicio</Link>
        </>
      )}
    </main>
  );
}
