import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // 暂时注释掉，避免 build 失败
  basePath: '/aidder',
  assetPrefix: '/aidder',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
