import { AutoSnakeGame } from "./components/AutoSnakeGame";
import { BlogCard } from "./components/BlogCard";
import { ProfileCard } from "./components/ProfileCard";

export function HomePage() {
  return (
    <>
      {/* 自動操縦スネークゲーム */}
      <div className="mb-8">
        <AutoSnakeGame />
      </div>

      {/* カードセクション */}
      <div className="space-y-6">
        <ProfileCard />
        <BlogCard />
      </div>
    </>
  );
}

