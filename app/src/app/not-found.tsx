import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-16">
      <div className="max-w-xl mx-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">404</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          ページが見つかりません
        </h1>
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          URLが間違っているか、ページが移動/削除された可能性があります。
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-sm font-semibold"
          >
            ホームへ戻る
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            記事一覧を見る
          </Link>
        </div>
      </div>
    </main>
  );
}


