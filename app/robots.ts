import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/conversations", "/schedule", "/presentation", "/api/"],
    },
    sitemap: "https://www.joinbearteam.com/sitemap.xml",
    host: "https://www.joinbearteam.com",
  };
}
