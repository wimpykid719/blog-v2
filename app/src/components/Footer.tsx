import Link from "next/link";
import { getSiteConfig } from "@/config/site";
import svgPaths from "@/imports/svg-vlysciruhp";

interface FooterProps {
  maxWidth?: "md" | "6xl";
}

export function Footer({ maxWidth = "md" }: FooterProps) {
  const config = getSiteConfig();
  const year = new Date().getFullYear();
  const maxWidthClass = maxWidth === "6xl" ? "max-w-6xl" : "max-w-md";

  const zennUrl = `https://zenn.dev/${config.platforms.zenn.userName}`;
  const qiitaUrl = `https://qiita.com/${config.platforms.qiita.userName}`;

  return (
    <footer className="mt-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
      <div
        className={`${maxWidthClass} mx-auto px-6 py-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="min-w-0">
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {config.site.name}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {config.site.description}
          </p>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            © {year} {config.author.name}
          </p>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
          aria-label="サイトナビゲーション"
        >
          <Link
            href="/"
            className="text-gray-700 dark:text-gray-300 hover:text-[#118ab2] dark:hover:text-[#4dd0e1] transition-colors"
          >
            ホーム
          </Link>
          <Link
            href="/articles"
            className="text-gray-700 dark:text-gray-300 hover:text-[#118ab2] dark:hover:text-[#4dd0e1] transition-colors"
          >
            記事一覧
          </Link>
          <Link
            href="/rss.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-[#118ab2] dark:hover:text-[#4dd0e1] transition-colors"
          >
            RSS
          </Link>
          <a
            href={zennUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-[#118ab2] dark:hover:text-[#4dd0e1] transition-colors"
          >
            Zenn
          </a>
          <a
            href={qiitaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-[#118ab2] dark:hover:text-[#4dd0e1] transition-colors"
          >
            Qiita
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {config.social.x && (
            <a
              href={config.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
              aria-label="X"
            >
              <div className="w-4 h-4 text-gray-500 dark:text-gray-400">
                <svg
                  className="block size-full"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 9.35069 9.625"
                >
                  <title>X</title>
                  <path d={svgPaths.p3d506f00} fill="currentColor" />
                </svg>
              </div>
            </a>
          )}

          {config.social.github && (
            <a
              href={config.social.github}
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
        </div>
      </div>
    </footer>
  );
}

