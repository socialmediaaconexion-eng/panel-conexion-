// Convierte el video_url de una lección en lo que necesita el reproductor.
// Acepta YouTube (incluido no listado y Shorts), Vimeo (incluido no listado con hash) y archivos directos (mp4, webm, m3u8).
export type FuenteVideo =
  | { tipo: "youtube"; embed: string }
  | { tipo: "vimeo"; embed: string }
  | { tipo: "archivo"; src: string }
  | { tipo: "ninguno" };

export function fuenteVideo(url: string | null | undefined): FuenteVideo {
  const u = (url ?? "").trim();
  if (!u) return { tipo: "ninguno" };
  let p: URL;
  try { p = new URL(u, "https://conexionteam.app"); } catch { return { tipo: "ninguno" }; }
  const host = p.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be" || host.endsWith("youtube.com") || host === "youtube-nocookie.com") {
    let id = host === "youtu.be" ? p.pathname.slice(1) : p.searchParams.get("v");
    if (!id) {
      const m = p.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = m?.[1] ?? null;
    }
    if (id && /^[\w-]{6,20}$/.test(id)) {
      return { tipo: "youtube", embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` };
    }
    return { tipo: "ninguno" };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const partes = p.pathname.split("/").filter(Boolean);
    const i = partes.findIndex((s) => /^\d+$/.test(s));
    if (i === -1) return { tipo: "ninguno" };
    const id = partes[i];
    // No listado: vimeo.com/ID/HASH o player.vimeo.com/video/ID?h=HASH
    const hash = p.searchParams.get("h") ?? (partes[i + 1] && /^[\da-f]+$/i.test(partes[i + 1]) ? partes[i + 1] : null);
    return { tipo: "vimeo", embed: `https://player.vimeo.com/video/${id}?${hash ? `h=${hash}&` : ""}dnt=1&title=0&byline=0&portrait=0` };
  }

  if (p.protocol === "https:" || p.protocol === "http:" || u.startsWith("/")) return { tipo: "archivo", src: u };
  return { tipo: "ninguno" };
}

export type Recurso = { nombre: string; url: string };

// Recursos guardados en jsonb: se limpian para no mostrar basura si alguien los edita a mano.
export function recursosDe(v: unknown): Recurso[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((r) => ({ nombre: String((r as Recurso)?.nombre ?? "").trim(), url: String((r as Recurso)?.url ?? "").trim() }))
    .filter((r) => r.url && /^(https?:\/\/|\/)/.test(r.url))
    .map((r) => ({ ...r, nombre: r.nombre || "Descargar recurso" }));
}

// Texto del panel → recursos. Una línea por recurso: "Nombre | https://..."
export function recursosDesdeTexto(txt: string): Recurso[] {
  return recursosDe(
    txt.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
      const [a, b] = l.includes("|") ? l.split("|", 2) : ["", l];
      return { nombre: a.trim(), url: (b ?? "").trim() };
    }),
  );
}

export const recursosATexto = (r: Recurso[]) => r.map((x) => `${x.nombre} | ${x.url}`).join("\n");
