import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleDetailPage } from "@/features/articles/[slug]/page";
import { getArticleBySlug } from "../../_utils/fetcher/markdown";

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

interface ArticleDetailContainerProps {
  slug: string;
}

export async function ArticleDetailContainer({
  slug,
}: ArticleDetailContainerProps) {
  const article = await getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const currentUrl = await getCurrentUrl(slug);

  return <ArticleDetailPage article={article} currentUrl={currentUrl} />;
}

