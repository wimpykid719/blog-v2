import type { MetadataRoute } from "next";
import { getAllArticleIndex } from "./articles/_utils/fetcher/markdown";
import { getSiteUrl } from "@/config/site";

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
    const lastModified = new Date(a.frontMatter.date);
    return {
      url: `${base}/articles/${encodeURIComponent(a.slug)}`,
      ...(Number.isFinite(lastModified.getTime()) ? { lastModified } : {}),
    };
  });

  return [...staticUrls, ...articleUrls];
}


