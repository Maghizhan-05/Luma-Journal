import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup"],
      // Personal data lives under /app — never index it.
      disallow: ["/app", "/app/", "/api"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
