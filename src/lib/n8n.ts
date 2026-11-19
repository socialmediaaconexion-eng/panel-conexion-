import "server-only";

// Envía un evento al webhook de n8n. Sin URL configurada no hace nada ("omitido").
// n8n valida el encabezado X-Conexion-Secret contra N8N_SECRET.
export async function enviarAN8n(url: string | undefined, payload: unknown): Promise<string> {
  if (!url) return "omitido";
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Conexion-Secret": process.env.N8N_SECRET ?? "" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    return r.ok ? "enviado" : `error:${r.status}`;
  } catch (e) {
    return `error:${e instanceof Error ? e.message.slice(0, 80) : "desconocido"}`;
  }
}
