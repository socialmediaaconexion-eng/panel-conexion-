import Link from "next/link";
import { verificarLead, slotsDisponibles } from "@/lib/agenda";
import { agendarLlamada } from "../actions";
import { AgendaForm } from "./form";

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

  const slots = await slotsDisponibles();
  const porDia = new Map<string, { iso: string; label: string }[]>();
  for (const iso of slots.keys()) {
    const d = dia.format(new Date(iso));
    porDia.set(d, [...(porDia.get(d) ?? []), { iso, label: hora.format(new Date(iso)) }]);
  }

  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      <h1 className="embudo-h1">Elige el horario de tu llamada</h1>
      <p className="embudo-lead">45 minutos, por videollamada. Horarios en hora de Colombia.</p>
      {porDia.size === 0 ? (
        <div className="alert error">No hay horarios libres esta semana. Te escribiremos por WhatsApp para coordinar.</div>
      ) : (
        <AgendaForm action={agendarLlamada.bind(null, lead, t)} dias={[...porDia.entries()]} />
      )}
    </main>
  );
}
