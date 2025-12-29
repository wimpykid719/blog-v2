import { AutoSnakeGame } from "./components/AutoSnakeGame";
import { BlogCard } from "./components/BlogCard";
import { NotificationBadge } from "./components/NotificationBadge";
import { ProfileCard } from "./components/ProfileCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900">
                DevSpot <NotificationBadge />
              </h1>
              <p className="text-xs text-gray-600">　こんにちは</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="p-1">
                <div className="flex flex-col gap-1">
                  <div className="w-0.5 h-0.5 bg-gray-900 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-gray-900 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-gray-900 rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-6 mt-8">
        {/* 自動操縦スネークゲーム */}
        <div className="mb-8">
          <AutoSnakeGame />
        </div>

        {/* カードセクション */}
        <div className="space-y-6">
          <ProfileCard />
          <BlogCard />
        </div>
      </main>
    </div>
  );
}
