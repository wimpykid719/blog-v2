import { notFound } from "next/navigation";
import { ArticleCard } from "../components/ArticleCard";
import { Header } from "../components/Header";
import Pagination from "../components/Pagination";
import { getAllArticles } from "../utils/markdown";

const PAGE_SIZE = 30;

type ArticlesPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

function parsePageParam(
  pageParam: string | string[] | undefined,
  lastPage: number,
): number | null {
  const raw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const value = raw ?? "1";

  // 数値として不正（空、整数以外、0以下）は404
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;

  // 範囲外は404
  if (parsed > Math.max(lastPage, 1)) return null;
  return parsed;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const articles = await getAllArticles();
  const lastPage = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const currentPage = parsePageParam((await searchParams)?.page, lastPage);
  if (currentPage === null) {
    notFound();
  }
  const pagedArticles = articles.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Header maxWidth="6xl" />

      {/* ヒーローセクション */}
      <section className="max-w-6xl mx-auto px-6 mt-12 mb-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          技術ブログ
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          日々の学習や開発の中で得た知見をアウトプットしています。Web技術を中心に、個人的なメモから技術解説まで幅広く書いています。
        </p>
      </section>

      {/* 記事グリッド */}
      <section className="max-w-6xl mx-auto px-6">
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              記事がまだありません。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* ページネーション */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mt-12">
          <Pagination
            path="/articles?page="
            page={currentPage}
            lastPage={lastPage}
            siblingCount={2}
          />
        </section>
      )}
    </div>
  );
}
