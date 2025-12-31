import raw from "./site.json";

export type SiteConfig = {
  site: {
    name: string;
    description: string;
    /**
     * 末尾スラッシュなしの絶対URL（例: "https://example.com"）
     * 空の場合は NEXT_PUBLIC_SITE_URL を参照し、それも無ければ localhost にフォールバック
     */
    url: string;
  };
  author: {
    name: string;
    age: number;
    projectsCount: number;
    hourlyRate: string;
    bio: string;
  };
  platforms: {
    zenn: { userName: string };
    qiita: { userName: string };
  };
  social: {
    x: string;
    github: string;
    website: string;
  };
  skills: string[];
};

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function getEnv(name: string): string {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

export function getSiteConfig(): SiteConfig {
  // JSONをベースに、必要に応じて環境変数で上書きできるようにする（デプロイ時に便利）
  const siteUrl = getEnv("NEXT_PUBLIC_SITE_URL") || raw.site.url;
  const zennUserName = getEnv("ZENN_USER_NAME") || raw.platforms.zenn.userName;
  const qiitaUserName =
    getEnv("QIITA_USER_NAME") || raw.platforms.qiita.userName;

  return {
    ...raw,
    site: {
      ...raw.site,
      url: trimTrailingSlash(siteUrl || "http://localhost:3000"),
    },
    platforms: {
      zenn: { userName: zennUserName },
      qiita: { userName: qiitaUserName },
    },
  };
}

export function getSiteUrl(): URL {
  return new URL(getSiteConfig().site.url);
}
