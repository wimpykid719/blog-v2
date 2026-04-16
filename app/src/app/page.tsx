import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteConfig } from "@/config/site";
import { getAppPageUrl } from "@/utils/seo";
import { HomeContainer } from "./_container/Container";

export const metadata: Metadata = {
  title: getSiteConfig().site.name,
  description: getSiteConfig().site.description,
  alternates: {
    canonical: getAppPageUrl("/"),
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-md mx-auto px-6 my-8 w-full">
        <HomeContainer />
      </main>

      <Footer />
    </div>
  );
}
