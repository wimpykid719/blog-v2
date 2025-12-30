import type { Metadata } from "next";
import { getSiteConfig, getSiteUrl } from "@/config/site";
import type { Article, ArticleFrontMatter } from "@/types/article";

function safeJoinUrl(base: URL, pathname: string): string {
  const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(p, base).toString();
}

export function getAppPageUrl(pathname: string): string {
  return safeJoinUrl(getSiteUrl(), pathname);
}

export function getCanonicalSourceUrl(args: {
  slug: string;
  frontMatter: ArticleFrontMatter;
}): string | null {
  const cfg = getSiteConfig();
  const qiitaId =
    typeof args.frontMatter.qiitaId === "string"
      ? args.frontMatter.qiitaId.trim()
      : "";

  if (qiitaId) {
    const user = cfg.platforms.qiita.userName?.trim();
    if (!user) return null;
    return `https://qiita.com/${encodeURIComponent(user)}/items/${encodeURIComponent(qiitaId)}`;
  }

  const user = cfg.platforms.zenn.userName?.trim();
  if (!user) return null;
  return `https://zenn.dev/${encodeURIComponent(user)}/articles/${encodeURIComponent(args.slug)}`;
}

function stripMarkdownToText(markdown: string): string {
  return (
    markdown
      // code blocks
      .replace(/```[\s\S]*?```/g, " ")
      // inline code
      .replace(/`[^`]*`/g, " ")
      // images/links
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
      // headings/blockquote/list markers
      .replace(/^\s{0,3}#{1,6}\s+/gm, "")
      .replace(/^\s{0,3}>\s?/gm, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // emphasis
      .replace(/[*_~]/g, "")
      // extra whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}

export function buildArticleDescription(article: Article): string | undefined {
  const cfg = getSiteConfig();
  const text = stripMarkdownToText(article.content);
  if (!text) return cfg.site.description || undefined;
  const clipped = text.length > 160 ? `${text.slice(0, 157)}...` : text;
  return clipped || cfg.site.description || undefined;
}

export function buildDefaultMetadata(): Metadata {
  const cfg = getSiteConfig();
  const base = getSiteUrl();
  const googleSiteVerification =
    typeof process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION.trim()
      : "";

  return {
    metadataBase: base,
    title: {
      default: cfg.site.name,
      template: `%s | ${cfg.site.name}`,
    },
    description: cfg.site.description,
    ...(googleSiteVerification
      ? { verification: { google: googleSiteVerification } }
      : {}),
    openGraph: {
      type: "website",
      siteName: cfg.site.name,
      title: cfg.site.name,
      description: cfg.site.description,
      url: base.toString(),
      images: [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: cfg.site.name,
      description: cfg.site.description,
      images: ["/opengraph-image"],
    },
  };
}
