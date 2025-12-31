"use client";

import { useState } from "react";
import { getSiteConfig } from "@/config/site";

export function SkillsCard() {
  const config = getSiteConfig();
  const { skills } = config;
  const DISPLAY_COLLAPSE_LENGTH = 20;
  const [isCollapse, setCollapse] = useState(
    DISPLAY_COLLAPSE_LENGTH < skills.length,
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 relative">
      {/* タグ */}
      <div className="absolute top-4 right-4 bg-[#22c55e]/30 dark:bg-[#22c55e]/20 px-3 h-4 rounded-xl flex items-center">
        <span className="text-[#22c55e] dark:text-[#4ade80] text-[10px] font-bold">
          skills
        </span>
      </div>

      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-bold text-gray-900 dark:text-gray-100">
          使用可能な技術スタック
        </h2>
      </div>

      {/* スキルタグ */}
      <div
        className={`flex flex-wrap gap-2 ${
          isCollapse && "overflow-hidden max-h-40 lg:max-h-56"
        }`}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {skill}
          </span>
        ))}
      </div>
      {isCollapse && (
        <div
          className={`
          bg-linear-to-t from-white dark:from-gray-800
          flex justify-center
          items-end w-full relative
          h-24 ${isCollapse && "-mt-24"}
        `}
        >
          <button
            type="button"
            className="text-sm text-gray-500 dark:text-gray-400 hover:opacity-70 cursor-pointer"
            onClick={() => setCollapse(false)}
          >
            もっと見る
          </button>
        </div>
      )}
    </div>
  );
}
