import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/dashboard",
        "/laporan-pkl",
        "/login",
        "/offline.html",
        "/profil-kelas",
        "/projects",
        "/register",
      ],
    },
    sitemap: `${SITE_URL.toString().replace(/\/$/, "")}/sitemap.xml`,
    host: SITE_URL.host,
  };
}
