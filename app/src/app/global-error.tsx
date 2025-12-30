"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <title>エラーが発生しました</title>
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-16">
        <div className="max-w-xl mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">500</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            エラーが発生しました
          </h1>
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
            お手数ですが時間を置いて再度お試しください。
          </p>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-sm font-semibold"
            >
              再読み込み
            </button>
          </div>
          {process.env.NODE_ENV !== "production" && (
            <pre className="mt-8 whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400">
              {String(error?.message || error)}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}


