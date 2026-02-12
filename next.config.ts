import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  // basePath: '/aidder',
  // assetPrefix: '/aidder',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
