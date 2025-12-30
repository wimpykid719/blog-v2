import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Header } from "../../components/Header";
import { MarkdownContent } from "../../components/MarkdownContent";
import { ShareButtons } from "../../components/ShareButtons";
import { getAllArticleIndex, getArticleBySlug } from "../../utils/markdown";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getCurrentUrl(slug: string): Promise<string> {
  try {
    const headersList = await headers();
    // Next.js 16ではheaders()がReadonlyHeadersを返す可能性があるため、
    // getメソッドが使えない場合は環境変数を使用
    let host = "localhost:3000";
    let protocol = "http";

    if (typeof headersList.get === "function") {
      host = headersList.get("host") || host;
      protocol = headersList.get("x-forwarded-proto") || protocol;
    } else {
      // 環境変数から取得を試みる
      host =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") || host;
      protocol = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https")
        ? "https"
        : protocol;
    }

    return `${protocol}://${host}/articles/${slug}`;
  } catch {
    // フォールバック: 環境変数またはデフォルト値を使用
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return `${baseUrl}/articles/${slug}`;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const { frontMatter, content } = article;
  const currentUrl = await getCurrentUrl(slug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Header maxWidth="6xl" />

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
    </div>
  );
}

export async function generateStaticParams() {
  const index = await getAllArticleIndex();
  return index.map((a) => ({ slug: a.slug }));
}
