import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Enlace del correo "Olvidé mi contraseña" de Supabase. Acepta los dos formatos:
// - PKCE (por defecto): ?code=...  (funciona si se abre en el mismo navegador donde se pidió)
// - token_hash (plantilla de correo personalizada): ?token_hash=...&type=recovery  (funciona en cualquier dispositivo)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const pedido = url.searchParams.get("next") ?? "/curso";
  const next = pedido.startsWith("/curso") && !pedido.startsWith("//") ? pedido : "/curso";

  const supabase = await createClient();
  let ok = false;
  if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;

  return NextResponse.redirect(new URL(ok ? next : "/curso/login?e=enlace", url.origin));
}
