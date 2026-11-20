import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://conexionteam.app";
  return ["/vsl", "/aplicar", "/cotizar", "/privacidad", "/terminos"].map((p) => ({ url: base + p, changeFrequency: "monthly", priority: p === "/vsl" ? 1 : 0.5 }));
}
