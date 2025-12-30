import { MarkdownContent } from "@/components/MarkdownContent";
import { ShareButtons } from "@/components/ShareButtons";
import type { Article } from "@/types/article";

interface ArticleDetailPageProps {
  article: Article;
  currentUrl: string;
}

export function ArticleDetailPage({
  article,
  currentUrl,
}: ArticleDetailPageProps) {
  const { frontMatter, content } = article;

  return (
    <article className="max-w-4xl mx-auto px-6 mt-8">
      {/* タイトル */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {frontMatter.title}
      </h1>

      {/* 日付 */}
      <div className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <time dateTime={frontMatter.date}>{frontMatter.date}</time>
      </div>

      {/* SNSシェアボタン */}
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <ShareButtons title={frontMatter.title} url={currentUrl} />
      </div>

      {/* 記事コンテンツ */}
      <div className="prose prose-lg max-w-none">
        <MarkdownContent content={content} />
      </div>
    </article>
  );
}

