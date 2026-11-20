import Link from "next/link";
import { verificarLead, slotsDisponibles } from "@/lib/agenda";
import { agendarLlamada } from "../actions";
import { AgendaForm } from "./form";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Elige tu horario — Conexión" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ lead?: string; t?: string }> };

const dia = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Bogota" });
const hora = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" });

export default async function AgendaPage({ searchParams }: Props) {
  const { lead, t } = await searchParams;
  if (!lead || !t || !verificarLead(lead, t)) {
    return (
      <main className="embudo">
        <h1 className="embudo-h1">Este enlace no es válido</h1>
        <p className="embudo-lead"><Link href="/aplicar">Vuelve a aplicar</Link> para elegir tu horario.</p>
      </main>
    );
  }

  const { data: lead_ } = await createAdminClient().from("leads").select("nombre, calificacion").eq("id", lead).maybeSingle();
  const nombre = lead_?.nombre?.split(" ")[0] ?? "";
  const asesoria = lead_?.calificacion === "asesoria";
  const slots = await slotsDisponibles();
  const porDia = new Map<string, { iso: string; label: string }[]>();
  for (const iso of slots.keys()) {
    const d = dia.format(new Date(iso));
    porDia.set(d, [...(porDia.get(d) ?? []), { iso, label: hora.format(new Date(iso)) }]);
  }

  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-3d.png" alt="Conexión" className="embudo-logo" />
      {asesoria ? (
        <div className="resultado resultado-regalo">
          <span className="resultado-ico" aria-hidden="true">🎁</span>
          <p className="eyebrow">Tu resultado</p>
          <h1 className="lp-h2">{nombre ? `${nombre}, ` : ""}todavía no es el momento… y eso está perfecto</h1>
          <p>Hoy nuestro sistema completo sería como ponerle turbo a un carro que aún estamos armando. Y nosotros no vendemos turbos a quien primero necesita ruedas.</p>
          <p><strong>Así que te queremos regalar algo:</strong> una asesoría de <strong>20 minutos</strong> con alguien de nuestro equipo, para darte recomendaciones concretas para tu negocio y ver juntos cuándo y cómo podríamos trabajar.</p>
          <p className="resultado-firma">Sin costo, sin letra pequeña. Solo elige tu horario.</p>
        </div>
      ) : (
        <div className="resultado">
          <span className="resultado-ico" aria-hidden="true">✓</span>
          <p className="eyebrow">Tu resultado</p>
          <h1 className="lp-h2">{nombre ? `${nombre}, ` : ""}¡podemos trabajar juntos!</h1>
          <p>Por lo que nos contaste, tu negocio está listo para un sistema de captación. Agenda tu diagnóstico gratuito de <strong>30 minutos</strong>: después te contactamos y te enviamos <strong>la cotización a tu correo</strong>, con las instrucciones y toda la información.</p>
        </div>
      )}
      <h2 className="agenda-h">{asesoria ? "Elige el horario de tu asesoría de regalo" : "Elige el horario de tu diagnóstico"}</h2>
      <p className="muted small">{asesoria ? "20 minutos" : "30 minutos"} por videollamada · horarios en hora de Colombia.</p>
      {porDia.size === 0 ? (
        <div className="alert error">No hay horarios libres esta semana. Te escribiremos por WhatsApp para coordinar.</div>
      ) : (
        <AgendaForm action={agendarLlamada.bind(null, lead, t)} dias={[...porDia.entries()]} />
      )}
    </main>
  );
}
