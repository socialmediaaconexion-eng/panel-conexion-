import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/api", "/login", "/agenda", "/gracias"] }], sitemap: "https://conexionteam.app/sitemap.xml" };
}
