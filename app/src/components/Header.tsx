"use client";

import { Building2, Rss, SquarePen, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { NotificationBadge } from "@/components/NotificationBadge";

interface HeaderProps {
  maxWidth?: "md" | "6xl";
}

export function Header({ maxWidth = "md" }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const maxWidthClass = maxWidth === "6xl" ? "max-w-6xl" : "max-w-md";

  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className={`${maxWidthClass} mx-auto px-6 py-4`}>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100">
                  DevSpot <NotificationBadge />
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  　こんにちは
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer w-8 h-8 flex items-center justify-center"
                aria-label="メニュー"
                onClick={handleMenuClick}
              >
                <div className="flex flex-col gap-1">
                  <div className="w-0.5 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-full" />
                  <div className="w-0.5 h-0.5 bg-gray-900 dark:bg-gray-100 rounded-full" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* オーバーレイ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/30 backdrop-blur-md z-60 transition-opacity"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed top-0 right-0 h-screen w-[260px] bg-white dark:bg-gray-800 border-l border-neutral-300 dark:border-gray-700 flex flex-col z-70 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}
        `}
        aria-label="メニュー"
      >
        {/* ヘッダー */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-300 dark:border-gray-700">
          <h2 className="text-neutral-900 dark:text-gray-100 font-semibold">
            メニュー
          </h2>
          <button
            type="button"
            onClick={handleCloseSidebar}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            aria-label="メニューを閉じる"
          >
            <X className="w-5 h-5 text-neutral-700 dark:text-gray-300" />
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/rss.xml"
                target="_blank"
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 h-10 px-3 rounded-md transition-colors
                  text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 hover:text-neutral-900 dark:hover:text-white
                `}
              >
                <Rss className="w-5 h-5" />
                <span>RSSフィード</span>
              </Link>
              <Link
                href="/articles"
                target="_blank"
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 h-10 px-3 rounded-md transition-colors
                  text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 hover:text-neutral-900 dark:hover:text-white
                `}
              >
                <SquarePen className="w-5 h-5" />
                <span>技術ブログ</span>
              </Link>
              <Link
                href="https://employee-counter-ten.vercel.app"
                target="_blank"
                onClick={handleLinkClick}
                className={`
                  flex items-center gap-3 h-10 px-3 rounded-md transition-colors
                  text-neutral-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-700 hover:text-neutral-900 dark:hover:text-white
                `}
              >
                <Building2 className="w-5 h-5" />
                <span>正社員カウンター</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
