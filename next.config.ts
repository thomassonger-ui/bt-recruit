import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  async rewrites() {
    return [
      {
        source: '/bearteamos/:path*',
        destination: 'https://bearteam-os-dashboard.vercel.app/dashboard/:path*',
      },
    ];
  },
};

export default nextConfig;
