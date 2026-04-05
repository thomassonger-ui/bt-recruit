import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  async redirects() {
    return [
      {
        source: '/bearteamos',
        destination: 'https://bearteam-os-dashboard.vercel.app/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
