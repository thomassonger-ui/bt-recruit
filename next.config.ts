import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/bearteamos',
        destination: 'https://bearteam-os-dashboard.vercel.app',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
