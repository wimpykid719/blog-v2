import { ArticleCard } from "../components/ArticleCard";
import { Header } from "../components/Header";
import Pagination, { INITIAL_PAGE } from "../components/Pagination";
import { getAllArticles } from "../utils/markdown";

export default function ArticlesPage() {
  const articles = getAllArticles();

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
              記事がまだありません。content/articles/
              ディレクトリにマークダウンファイルを追加してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </section>

      {/* ページネーション */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 mt-12">
          <Pagination page={INITIAL_PAGE} lastPage={3} siblingCount={2} />
        </section>
      )}
    </div>
  );
}
