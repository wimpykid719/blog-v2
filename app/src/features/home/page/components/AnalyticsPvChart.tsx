"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type AnalyticsPvPoint = { date: string; label: string; pv: number };

function formatPv(v: unknown): string {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("ja-JP").format(n);
}

export function AnalyticsPvChart({ data }: { data: AnalyticsPvPoint[] }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!data || data.length === 0) return null;
  // ResponsiveContainer が初回レンダーで親サイズを取れず width/height=-1 警告を出すことがあるので、
  // マウント後にチャートを描画する（レイアウト確定後ならサイズ計測できる）
  if (!mounted) return <div className="h-40 w-full" aria-hidden="true" />;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={1}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="pvFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            width={32}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatPv(v)}
          />
          <Tooltip
            formatter={(value) => [`${formatPv(value)} PV`, "PV"]}
            labelFormatter={(label) => `${label}`}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#f3f4f6" : "#111827",
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.1)"
                : "1px solid rgba(0, 0, 0, 0.08)",
            }}
          />
          <Area
            type="monotone"
            dataKey="pv"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#pvFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
