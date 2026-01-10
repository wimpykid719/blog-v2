import "server-only";

import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { unstable_cache } from "next/cache";
import { getAllArticleIndex } from "@/app/articles/_utils/fetcher/markdown";

type EnabledData = {
  enabled: true;
  rangeLabel: string;
  totalPageViews: number;
  dailyPageViews: Array<{ date: string; label: string; pv: number }>;
  topArticles: Array<{
    path: string;
    slug: string;
    title: string;
    views: number;
  }>;
  updatedAtIso: string;
};

type DisabledData = {
  enabled: false;
  reason: "missing_env" | "error";
  message: string;
};

export type Ga4DashboardData = EnabledData | DisabledData;

function readEnvTrim(name: string): string {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

function getRequiredEnv() {
  const propertyId = readEnvTrim("GA4_PROPERTY_ID");
  const clientEmail = readEnvTrim("GA4_CLIENT_EMAIL");
  // JSONのprivate_keyは改行が \n として入るケースが多い
  const privateKeyRaw = readEnvTrim("GA4_PRIVATE_KEY");
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");

  const requiredEnv = [
    "GA4_PROPERTY_ID",
    "GA4_CLIENT_EMAIL",
    "GA4_PRIVATE_KEY",
  ];
  const missing = requiredEnv.filter((k) => !readEnvTrim(k));

  return {
    missing,
    propertyId,
    clientEmail,
    privateKey,
  };
}

function yyyymmddToIso(yyyymmdd: string): string | null {
  if (!/^\d{8}$/.test(yyyymmdd)) return null;
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${y}-${m}-${d}`;
}

function isoToLabel(iso: string): string {
  // "YYYY-MM-DD" -> "M/D"
  const [, m, d] = iso.split("-");
  const mm = Number.parseInt(m ?? "", 10);
  const dd = Number.parseInt(d ?? "", 10);
  if (!Number.isFinite(mm) || !Number.isFinite(dd)) return iso;
  return `${mm}/${dd}`;
}

function normalizeArticleSlugFromPath(
  pagePath: string,
): { path: string; slug: string } | null {
  const clean = pagePath.split("?")[0]?.split("#")[0] ?? "";
  if (!clean.startsWith("/articles/")) return null;
  const rest = clean.slice("/articles/".length);
  const seg = rest.split("/")[0] ?? "";
  let slug = "";
  if (seg) {
    try {
      slug = decodeURIComponent(seg);
    } catch {
      return null;
    }
  }
  if (!slug) return null;
  return { path: clean, slug };
}

async function fetchGa4Dashboard(): Promise<Ga4DashboardData> {
  const { missing, propertyId, clientEmail, privateKey } = getRequiredEnv();

  if (missing.length > 0) {
    // ユーザーに環境変数名などの詳細を返さない（情報露出を避ける）
    if (process.env.NODE_ENV !== "production") {
      console.warn("GA4 Data API is not configured. Missing env:", missing);
    }
    return {
      enabled: false,
      reason: "missing_env",
      message:
        "GA4 Data API（Analytics Dashboard）は未設定です。環境変数を設定すると、ページビューと人気ページを表示できます。",
    };
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    const property = `properties/${propertyId}`;
    const dateRanges = [{ startDate: "30daysAgo", endDate: "today" }];
    const rangeLabel = "過去30日";

    const [totalReport] = await client.runReport({
      property,
      dateRanges,
      metrics: [{ name: "screenPageViews" }],
    });

    const totalValue = totalReport.rows?.[0]?.metricValues?.[0]?.value ?? "0";
    const totalPageViews = Number.parseInt(totalValue, 10);

    const [dailyReport] = await client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const dailyPageViews =
      dailyReport.rows
        ?.map((row) => {
          const yyyymmdd = row.dimensionValues?.[0]?.value ?? "";
          const iso = yyyymmddToIso(yyyymmdd);
          const pvStr = row.metricValues?.[0]?.value ?? "0";
          const pv = Number.parseInt(pvStr, 10);
          if (!iso) return null;
          if (!Number.isFinite(pv)) return null;
          return { date: iso, label: isoToLabel(iso), pv };
        })
        .filter((v): v is NonNullable<typeof v> => Boolean(v)) ?? [];

    const [topArticlesReport] = await client.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/articles/" },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 5,
    });

    const index = await getAllArticleIndex();
    const titleBySlug = new Map(
      index.map((a) => [a.slug, a.frontMatter.title]),
    );

    const topArticles =
      topArticlesReport.rows
        ?.map((row) => {
          const pagePath = row.dimensionValues?.[0]?.value ?? "";
          const norm = normalizeArticleSlugFromPath(pagePath);
          if (!norm) return null;
          const viewsStr = row.metricValues?.[0]?.value ?? "0";
          const views = Number.parseInt(viewsStr, 10);
          if (!Number.isFinite(views)) return null;
          const title = titleBySlug.get(norm.slug) ?? norm.slug;
          return { path: norm.path, slug: norm.slug, title, views };
        })
        .filter((v): v is NonNullable<typeof v> => Boolean(v)) ?? [];

    return {
      enabled: true,
      rangeLabel,
      totalPageViews: Number.isFinite(totalPageViews) ? totalPageViews : 0,
      dailyPageViews,
      topArticles,
      updatedAtIso: new Date().toISOString(),
    };
  } catch (error) {
    // 例外詳細をそのままユーザーに返さない。ログも過剰な情報露出を避ける。
    const errMsg =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
    console.error("fetchGa4Dashboard error:", errMsg);
    return {
      enabled: false,
      reason: "error",
      message: "分析データの取得に失敗しました。",
    };
  }
}

export const getGa4DashboardData = unstable_cache(
  fetchGa4Dashboard,
  ["ga4-dashboard-v1"],
  { revalidate: 10 * 60 },
);
