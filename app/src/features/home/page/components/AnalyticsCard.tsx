import Link from "next/link";
import { getGa4DashboardData } from "@/server/ga4";
import { AnalyticsPvChart } from "./AnalyticsPvChart";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ja-JP").format(value);
}

export async function AnalyticsCard() {
  const data = await getGa4DashboardData();

  if (!data.enabled) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 relative border border-gray-100 dark:border-gray-700">
      {/* タグ */}
      <div className="absolute top-4 right-4 bg-[#a855f7]/20 dark:bg-[#a855f7]/15 px-3 h-4 rounded-xl flex items-center">
        <span className="text-[#a855f7] dark:text-[#d8b4fe] text-[10px] font-bold">
          analytics
        </span>
      </div>

      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <span className="material-icons-round text-[#a855f7]">analytics</span>
        <h2 className="font-bold text-gray-900 dark:text-gray-100">分析</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              ページビュー（{data.rangeLabel}）
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(data.totalPageViews)}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                PV
              </span>
            </div>
          </div>
        </div>

        <AnalyticsPvChart data={data.dailyPageViews} />

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
              人気の記事（Top {data.topArticles.length}）
            </p>
            <span className="text-[10px] text-gray-400">
              更新:{" "}
              {new Date(data.updatedAtIso).toLocaleString("ja-JP", {
                timeZone: "Asia/Tokyo",
              })}
            </span>
          </div>

          {data.topArticles.length === 0 ? (
            <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              データがありません。
            </p>
          ) : (
            <ol className="mt-3 space-y-2">
              {data.topArticles.map((p, idx) => (
                <li
                  key={`${p.slug}-${idx}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="inline-flex items-center justify-center min-w-[20px] w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-200 shrink-0">
                      {idx + 1}
                    </span>
                    <Link
                      href={`/articles/${encodeURIComponent(p.slug)}`}
                      className="min-w-0 truncate text-[11px] text-gray-900 dark:text-gray-100 font-medium hover:underline"
                    >
                      {p.title}
                    </Link>
                  </div>
                  <span className="shrink-0 text-[11px] text-gray-600 dark:text-gray-300 font-semibold">
                    {formatNumber(p.views)} PV
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
