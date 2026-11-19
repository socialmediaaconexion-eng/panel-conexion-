import { verificarLead } from "@/lib/agenda";
import { createAdminClient } from "@/lib/supabase/admin";
import { waLink } from "@/lib/format";

export const metadata = { title: "Llamada confirmada — Conexión" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ lead?: string; t?: string }> };

const cuando = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });

type CitaConfirmada = { start_at: string; sellers: { nombre: string; whatsapp: string | null } | null };

export default async function GraciasPage({ searchParams }: Props) {
  const { lead, t } = await searchParams;
  let cita: CitaConfirmada | null = null;
  let nombre = "";
  if (lead && t && verificarLead(lead, t)) {
    const admin = createAdminClient();
    const [{ data: c }, { data: l }] = await Promise.all([
      admin.from("citas").select("start_at, sellers(nombre, whatsapp)").eq("lead_id", lead).in("estado", ["agendada", "reagendada"]).order("start_at", { ascending: false }).limit(1).maybeSingle(),
      admin.from("leads").select("nombre").eq("id", lead).maybeSingle(),
    ]);
    cita = c as CitaConfirmada | null;
    nombre = l?.nombre?.split(" ")[0] ?? "";
  }

  const closer = cita?.sellers;
  const wa = closer ? waLink(closer.whatsapp, `Hola ${closer.nombre}, soy ${nombre}. Agendé una llamada con Conexión.`) : null;

  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      <h1 className="embudo-h1">{cita ? `Listo${nombre ? `, ${nombre}` : ""}: tu llamada quedó agendada` : "Gracias por aplicar"}</h1>
      {cita ? (
        <>
          <p className="embudo-lead"><strong>{cuando.format(new Date(cita.start_at))}</strong> (hora de Colombia){closer ? ` con ${closer.nombre}` : ""}.</p>
          <p className="muted">Llega con 2 o 3 ejemplos de marcas o páginas que te gusten — nos ayuda a aprovechar mejor los 45 minutos.</p>
          {wa && <a className="btn btn-big" href={wa} target="_blank" rel="noopener">Escribirle a {closer!.nombre} por WhatsApp</a>}
        </>
      ) : (
        <p className="embudo-lead">Recibimos tu información. Te contactaremos por WhatsApp para coordinar.</p>
      )}
    </main>
  );
}
