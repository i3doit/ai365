import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ai365',
  assetPrefix: '/ai365',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // 新增：构建时跳过 TypeScript 错误检查
  typescript: {
    ignoreBuildErrors: true,
  },
  // 新增：构建时跳过 ESLint 检查
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
