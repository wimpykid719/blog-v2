import { getSiteConfig, getSiteUrl } from "@/config/site";
import { getAllArticleIndex, getArticleBySlug } from "@/app/articles/_utils/fetcher/markdown";
import { buildArticleDescription, getAppPageUrl, getCanonicalSourceUrl } from "@/utils/seo";

export const revalidate = 60;

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseFrontMatterDate(input: string): Date | null {
  const raw = (input || "").trim();
  if (!raw) return null;

  // YYYY.MM.DD / YYYY-MM-DD / YYYY/MM/DD を許容
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

export async function GET() {
  const cfg = getSiteConfig();
  const siteUrl = getSiteUrl().toString().replace(/\/+$/, "");

  const index = await getAllArticleIndex();
  const latest = index.slice(0, 50);

  const itemsXml = await Promise.all(
    latest.map(async (idx) => {
      const slug = idx.slug;
      const appUrl = getAppPageUrl(`/articles/${slug}`);
      const canonicalSource =
        getCanonicalSourceUrl({ slug, frontMatter: idx.frontMatter }) ?? appUrl;

      const article = await getArticleBySlug(slug);
      const description = article ? buildArticleDescription(article) : undefined;

      const dt = parseFrontMatterDate(idx.frontMatter.date);
      const pubDate = dt ? dt.toUTCString() : undefined;

      const categories = Array.isArray(idx.frontMatter.topics)
        ? idx.frontMatter.topics
        : [];

      // RSS itemのlinkは「読者が開く先」なので、原本（canonical）を優先
      // guidは、このサイト側URLで固定（安定性のため）
      const guid = appUrl;

      return [
        "<item>",
        `<title>${escapeXml(idx.frontMatter.title)}</title>`,
        `<link>${escapeXml(canonicalSource)}</link>`,
        `<guid isPermaLink="true">${escapeXml(guid)}</guid>`,
        pubDate ? `<pubDate>${escapeXml(pubDate)}</pubDate>` : "",
        description ? `<description>${escapeXml(description)}</description>` : "",
        ...categories.map((c) => `<category>${escapeXml(c)}</category>`),
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    }),
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">` +
    `<channel>` +
    `<title>${escapeXml(cfg.site.name)}</title>` +
    `<link>${escapeXml(siteUrl)}</link>` +
    `<description>${escapeXml(cfg.site.description)}</description>` +
    `<language>ja</language>` +
    `<atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />` +
    itemsXml.join("") +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600",
    },
  });
}


