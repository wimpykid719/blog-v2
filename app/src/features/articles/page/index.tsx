import { ArticleCard } from "./components/ArticleCard";
import type { Article } from "@/types/article";

interface ArticlesPageProps {
  index: Array<{
    slug: string;
    frontMatter: Article["frontMatter"];
  }>;
}

export function ArticlesPage({ index }: ArticlesPageProps) {
  return (
    <>
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
        {index.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              記事がまだありません。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {index.map((item) => (
              <ArticleCard
                key={item.slug}
                article={{ ...item, content: "" }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

