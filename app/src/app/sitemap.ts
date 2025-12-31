import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { getAllArticleIndex } from "./articles/_utils/fetcher/markdown";

function parseFrontMatterDate(input: string | undefined | null): Date | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // YYYY.MM.DD / YYYY-MM-DD / YYYY/MM/DD を許容（環境依存の Date パースを避ける）
  const m = raw.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const dt = new Date(Date.UTC(y, mo - 1, d, 0, 0, 0));
    return Number.isFinite(dt.getTime()) ? dt : null;
  }

  const dt = new Date(raw);
  return Number.isFinite(dt.getTime()) ? dt : null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().toString().replace(/\/+$/, "");

  const index = await getAllArticleIndex();

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
    },
    {
      url: `${base}/articles`,
    },
  ];

  const articleUrls: MetadataRoute.Sitemap = index.map((a) => {
    const lastModified = parseFrontMatterDate(a.frontMatter.date);
    return {
      url: `${base}/articles/${encodeURIComponent(a.slug)}`,
      ...(lastModified ? { lastModified } : {}),
    };
  });

  return [...staticUrls, ...articleUrls];
}
