"use client";

import { Building, Globe, User } from "lucide-react";
import { getSiteConfig } from "@/config/site";
import svgPaths from "@/imports/svg-vlysciruhp";

export function ProfileCard() {
  const config = getSiteConfig();
  const { author, social } = config;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-6 relative">
      {/* タグ */}
      <div className="absolute top-4 right-4 bg-[#f27059]/30 dark:bg-[#f27059]/20 px-3 h-4 rounded-xl flex items-center">
        <span className="text-[#f27059] dark:text-[#ff8a75] text-[10px] font-bold">
          developer
        </span>
      </div>

      {/* タイトル */}
      <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
        {author.name}
      </h2>

      {/* メタ情報 */}
      <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{author.age}歳</span>
        </div>
        <div className="flex items-center gap-1">
          <Building className="w-3 h-3" />
          <span>こなした案件数 {author.projectsCount}件</span>
        </div>
      </div>

      {/* 説明文 */}
      <p className="text-[10px] leading-relaxed text-gray-900 dark:text-gray-300 mb-4">
        {author.bio}
      </p>

      {/* 絵文字 */}
      <div className="absolute bottom-4 right-4 text-5xl">👨🏻‍💻</div>

      {/* SNSリンク */}
      <div className="flex items-center gap-3 mt-2">
        {social.x && (
          <a
            href={social.x}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            aria-label="Twitter"
          >
            <div className="w-4 h-4 text-gray-500 dark:text-gray-400">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 9.35069 9.625"
              >
                <title>Twitter</title>
                <path d={svgPaths.p3d506f00} fill="currentColor" />
              </svg>
            </div>
          </a>
        )}
        {social.github && (
          <a
            href={social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            aria-label="GitHub"
          >
            <div className="w-4 h-4 text-gray-500 dark:text-gray-400">
              <svg
                className="block size-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 10.1668 10.1669"
              >
                <title>GitHub</title>
                <g>
                  <path
                    d={svgPaths.p35677c00}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path
                    d={svgPaths.p2c1e6500}
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              </svg>
            </div>
          </a>
        )}
        {social.website && (
          <a
            href={social.website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
            aria-label="Website"
          >
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </a>
        )}
      </div>
    </div>
  );
}
