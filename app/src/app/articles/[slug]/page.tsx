import { Header } from "@/components/Header";
import { ArticleDetailContainer } from "./_container/Container";
import { getAllArticleIndex } from "../_utils/fetcher/markdown";

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

export async function generateStaticParams() {
  const index = await getAllArticleIndex();
  return index.map((a) => ({ slug: a.slug }));
}
