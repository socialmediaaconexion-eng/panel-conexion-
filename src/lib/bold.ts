import "server-only";

// API de Links de pago de Bold (developers.bold.co/pagos-en-linea/api-link-de-pagos).
// Auth: "Authorization: x-api-key <llave de identidad>" del Botón de pagos. Sin llave → no se crea el link.
const BASE = "https://integrations.api.bold.co/online/link/v1";

export const ESTADO_BOLD: Record<string, string> = {
  ACTIVE: "pendiente", PROCESSING: "procesando", PAID: "pagado",
  REJECTED: "rechazado", CANCELLED: "cancelado", EXPIRED: "expirado",
};

export function boldConfigurado() { return Boolean(process.env.BOLD_API_KEY); }

function headers() {
  return { "Content-Type": "application/json", Authorization: `x-api-key ${process.env.BOLD_API_KEY}` };
}

export async function crearLinkBold(p: { monto: number; moneda: "USD" | "COP"; descripcion: string; referencia: string; email?: string | null; venceDias?: number }):
  Promise<{ ok: true; link: string; url: string } | { ok: false; error: string }> {
  if (!boldConfigurado()) return { ok: false, error: "Bold no está conectado (falta BOLD_API_KEY)." };
  const body: Record<string, unknown> = {
    amount_type: "CLOSE",
    amount: { currency: p.moneda, total_amount: p.monto, tip_amount: 0, taxes: [] },
    reference: p.referencia.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 60),
    description: p.descripcion.slice(0, 100).padEnd(2, " "),
    callback_url: "https://conexionteam.app/pago-recibido",
    // Bold espera nanosegundos desde epoch (verificado: en ms responde "expiration date must be greater…").
    expiration_date: (Date.now() + (p.venceDias ?? 7) * 86400_000) * 1_000_000,
  };
  if (p.email) body.payer_email = p.email;
  try {
    const r = await fetch(BASE, { method: "POST", headers: headers(), body: JSON.stringify(body), signal: AbortSignal.timeout(12000) });
    const j = await r.json().catch(() => null);
    const link = j?.payload?.payment_link, url = j?.payload?.url;
    if (!r.ok || !link || !url) return { ok: false, error: (j?.errors?.[0]?.errors ?? j?.errors?.[0]?.message ?? j?.message ?? `Bold respondió ${r.status}`).toString().slice(0, 200) };
    return { ok: true, link, url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message.slice(0, 200) : "Error de conexión con Bold" };
  }
}

export async function estadoLinkBold(link: string): Promise<string | null> {
  if (!boldConfigurado()) return null;
  try {
    const r = await fetch(`${BASE}/${encodeURIComponent(link)}`, { headers: headers(), signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    const st = j?.status ?? j?.payload?.status;
    return typeof st === "string" ? ESTADO_BOLD[st] ?? null : null;
  } catch {
    return null;
  }
}
