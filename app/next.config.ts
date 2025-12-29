import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 完全に静的エクスポートする場合（任意の静的ホスティングにデプロイ可能）
  // output: 'export',
};

export default nextConfig;
