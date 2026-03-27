import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/bearteamos/:path*',
        destination: 'https://bearteam-os-dashboard.vercel.app/:path*',
      },
    ];
  },
};

export default nextConfig;
