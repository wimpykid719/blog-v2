"use client";

import Link from "next/link";
import { NotificationBadge } from "@/components/NotificationBadge";

interface HeaderProps {
  maxWidth?: "md" | "6xl";
}

export function Header({ maxWidth = "md" }: HeaderProps) {
  const maxWidthClass = maxWidth === "6xl" ? "max-w-6xl" : "max-w-md";

  return (
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
            <button type="button" className="p-1" aria-label="メニュー">
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
  );
}
