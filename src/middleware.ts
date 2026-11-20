import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && request.nextUrl.pathname.startsWith("/panel")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // Área del alumno: sin sesión va al login del curso (la guarda requireAlumno decide el resto).
  const p = request.nextUrl.pathname;
  const publicaCurso = p === "/curso/login" || p.startsWith("/curso/auth/") || p === "/curso/manifest.webmanifest";
  if (!user && p.startsWith("/curso") && !publicaCurso) {
    const url = request.nextUrl.clone();
    url.pathname = "/curso/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/panel/:path*", "/login", "/curso/:path*", "/curso"],
};
