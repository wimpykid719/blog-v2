import type { Metadata } from "next";
import { Header } from "@/components/Header";
import {
  buildArticleDescription,
  getAppPageUrl,
  getCanonicalSourceUrl,
} from "@/utils/seo";
import {
  getAllArticleIndex,
  getArticleBySlug,
} from "../_utils/fetcher/markdown";
import { ArticleDetailContainer } from "./_container/Container";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Header maxWidth="6xl" />
      <ArticleDetailContainer slug={slug} />
    </div>
  );
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return {
      title: "記事が見つかりません",
      robots: { index: false, follow: false },
    };
  }

  const canonicalSource = getCanonicalSourceUrl({
    slug,
    frontMatter: article.frontMatter,
  });
  const appUrl = getAppPageUrl(`/articles/${slug}`);

  return {
    title: article.frontMatter.title,
    description: buildArticleDescription(article),
    alternates: {
      canonical: canonicalSource ?? appUrl,
    },
    openGraph: {
      type: "article",
      title: article.frontMatter.title,
      description: buildArticleDescription(article),
      url: appUrl,
      images: [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.frontMatter.title,
      description: buildArticleDescription(article),
      images: ["/opengraph-image"],
    },
  };
}

export async function generateStaticParams() {
  const index = await getAllArticleIndex();
  return index.map((a) => ({ slug: a.slug }));
}
