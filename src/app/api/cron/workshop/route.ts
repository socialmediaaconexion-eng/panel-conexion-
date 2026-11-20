import { NextResponse } from "next/server";
import { activarPendientes } from "@/lib/workshop-acceso";

// Activación del workshop: revisa en Bold los links de las inscripciones pendientes y, si están pagados,
// activa la inscripción, crea el usuario del alumno y envía el correo de acceso.
// Llamarlo cada 5 minutos desde el scheduler (Supabase pg_cron), con "Authorization: Bearer CRON_SECRET".
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const resultado = await activarPendientes();
  return NextResponse.json({ ok: true, ...resultado });
}
