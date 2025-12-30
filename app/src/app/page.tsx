import { AutoSnakeGame } from "./components/AutoSnakeGame";
import { BlogCard } from "./components/BlogCard";
import { Header } from "./components/Header";
import { ProfileCard } from "./components/ProfileCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Header />

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
