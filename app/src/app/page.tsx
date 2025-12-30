import { Header } from "@/components/Header";
import { HomeContainer } from "./_container/Container";
import type { Metadata } from "next";
import { getAppPageUrl } from "@/utils/seo";
import { getSiteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "ホーム",
  description: getSiteConfig().site.description,
  alternates: {
    canonical: getAppPageUrl("/"),
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <Header />

      {/* メインコンテンツ */}
      <main className="max-w-md mx-auto px-6 mt-8">
        <HomeContainer />
      </main>
    </div>
  );
}
