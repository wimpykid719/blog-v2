import Link from "next/link";
import type { Article } from "../types/article";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { frontMatter, slug } = article;

  // プラットフォームバッジの色を決定（topicsから推測、またはデフォルト）
  const getPlatformBadge = () => {
    // ここではデフォルトでZennとしますが、frontmatterにplatformフィールドを追加することも可能
    return {
      label: "Zenn",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-700 dark:text-green-300",
    };
  };

  const platform = getPlatformBadge();

  // プラットフォームラベルの色を決定
  const getPlatformLabelColor = (label: string) => {
    if (label === "Zenn") {
      return {
        backgroundColor: "var(--color-blue-light)",
        color: "#118AB2",
      };
    } else if (label === "Qiita") {
      return {
        backgroundColor: "#E8F5E9",
        color: "#2E7D32",
      };
    } else {
      return {
        backgroundColor: "#F5F5F5",
        color: "#757575",
      };
    }
  };

  const labelColor = getPlatformLabelColor(platform.label);

  return (
    <Link href={`/articles/${slug}`}>
      <article className="group relative bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer">
        {/* 絵文字とプラットフォームバッジ */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
            {frontMatter.emoji}
          </span>
          <span
            className="px-2.5 py-1 rounded-md text-xs font-semibold"
            style={labelColor}
          >
            {platform.label}
          </span>
        </div>

        {/* タイトルとタグ */}
        <div className="grow">
          <h3 className="text-xl font-bold mb-3 leading-snug transition-colors">
            {frontMatter.title}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {frontMatter.topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                #{topic}
              </span>
            ))}
          </div>
        </div>

        {/* 日付と矢印 */}
        <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="material-icons-round text-base">
              calendar_today
            </span>
            <span>{frontMatter.date}</span>
          </div>
          <span className="group-hover:translate-x-1 transition-transform material-icons-round text-base">
            arrow_forward
          </span>
        </div>
      </article>
    </Link>
  );
}
