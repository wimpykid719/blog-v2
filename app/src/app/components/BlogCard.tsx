"use client";

import { NotificationBadge } from "./NotificationBadge";

export function BlogCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 relative">
      {/* タグ */}
      <div className="absolute top-4 right-4 bg-[#118ab2]/30 px-3 h-4 rounded-xl flex items-center">
        <span className="text-[#118ab2] text-[10px] font-bold">blog</span>
      </div>

      {/* 通知バッジ */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <NotificationBadge />
      </div>

      {/* タイトル */}
      <h2 className="font-bold text-gray-900 mb-3 mt-2">技術ブログ</h2>

      {/* 説明文 */}
      <p className="text-[10px] leading-relaxed text-gray-900">
        技術ブログを通じて継続的に学びをアウトプットし、知識の定着と技術力の向上に努めてきました。
      </p>
    </div>
  );
}
