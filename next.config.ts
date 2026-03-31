import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/bearteamos",
        destination: "https://bearteam-os-dashboard.vercel.app/login",
        permanent: false,
      },
      {
        source: "/crm",
        destination: "https://bearteam-os-dashboard.vercel.app/pipeline",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/join",
        destination: "/join.html",
      },
    ];
  },
};

export default nextConfig;
