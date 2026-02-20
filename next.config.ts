import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: 'export',
   basePath: '/ai365',
   assetPrefix: '/ai365',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
