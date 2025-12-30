import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import Pagination from "@/components/Pagination";
import { ArticlesContainer } from "./_container/Container";
import { getAllArticleIndex } from "./_utils/fetcher/markdown";

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
  const index = await getAllArticleIndex();
  const lastPage = Math.max(1, Math.ceil(index.length / PAGE_SIZE));
  const currentPage = parsePageParam((await searchParams)?.page, lastPage);
  if (currentPage === null) {
    notFound();
  }
  const pagedIndex = index.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Header maxWidth="6xl" />

      <ArticlesContainer index={pagedIndex} />

      {/* ページネーション */}
      {index.length > 0 && (
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
