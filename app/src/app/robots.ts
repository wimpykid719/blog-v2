import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

// `getSiteUrl()` 自体は安全だが、metadata route を Edge に寄せた環境での不整合を避けるため固定
export const runtime = "nodejs";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().toString().replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}


