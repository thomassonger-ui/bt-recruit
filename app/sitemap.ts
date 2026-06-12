import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.joinbearteam.com";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/scout`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/orlando-real-estate-brokerage`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/commission-splits`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/no-fee-brokerage`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/switch-brokerages-florida`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/academy`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
