import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/goHome/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/goHome' : '',
  experimental: {
    esmExternals: false,
  },
};

export default nextConfig;
