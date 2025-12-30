import { FileText } from "lucide-react";
import Link from "next/link";
import { getAllArticleIndex } from "../utils/markdown";

function getCutoffDate(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d;
}

export async function BlogCard() {
  const index = await getAllArticleIndex();
  const totalCount = index.length;

  const cutoff = getCutoffDate();
  const recentItems = index.filter((a) => {
    const t = new Date(a.frontMatter.date).getTime();
    if (!Number.isFinite(t)) return false;
    return t >= cutoff.getTime();
  });
  const recentCount = recentItems.length;
  const hasRecent = recentCount > 0;

  return (
    <Link
      href="/articles"
      className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 relative overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      aria-label="技術ブログの記事一覧へ"
    >
      {/* タグ */}
      <div className="absolute top-4 right-4 bg-[#118ab2]/30 dark:bg-[#118ab2]/20 px-3 h-4 rounded-xl flex items-center">
        <span className="text-[#118ab2] dark:text-[#4dd0e1] text-[10px] font-bold">
          blog
        </span>
      </div>

      {/* 新着バッジ（1ヶ月以内に投稿がある場合のみ） */}
      {hasRecent && (
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-200">
            <span className="relative inline-flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            新着 {recentCount}件
          </span>
        </div>
      )}

      {/* タイトル */}
      <h2 className="relative font-bold text-gray-900 dark:text-gray-100 mb-2 mt-5">
        技術ブログ
      </h2>

      {/* 記事数 */}
      <div className="relative flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mb-3">
        <FileText className="w-3 h-3" />
        <span className="font-semibold">全{totalCount}記事</span>
        {hasRecent && (
          <span className="text-[10px] text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
            1ヶ月以内に更新あり
          </span>
        )}
      </div>

      {/* 説明文 */}
      <p className="relative text-[10px] leading-relaxed text-gray-900 dark:text-gray-300">
        技術ブログを通じて継続的に学びをアウトプットし、知識の定着と技術力の向上に努めてきました。
      </p>

      {/* CTA */}
      <div className="relative mt-4 flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-300">
        <span className="font-semibold">記事一覧を見る</span>
        <span className="material-icons-round text-base group-hover:translate-x-1 transition-transform">
          arrow_forward
        </span>
      </div>
    </Link>
  );
}
