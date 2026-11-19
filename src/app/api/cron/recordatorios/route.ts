import { NextResponse } from "next/server";
import { procesarRecordatorios } from "@/lib/notificaciones";

// Called every few minutes by the scheduler (Supabase pg_cron), authenticated with CRON_SECRET.
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const resultado = await procesarRecordatorios();
  return NextResponse.json({ ok: true, ...resultado });
}
