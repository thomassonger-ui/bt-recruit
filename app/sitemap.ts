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
    { url: `${base}/100-percent-commission`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/your-numbers`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/new-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/join-a-team`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/place-your-license`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/switch-brokerages-florida`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/blog/bear-team-vs-exp-realty-orlando-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/bear-team-vs-keller-williams-orlando-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/bear-team-vs-lpt-realty-orlando-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/bear-team-vs-exit-realty-orlando-agents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/signs-its-time-to-leave-your-real-estate-brokerage`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/my-brokerage-doesnt-give-me-leads`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/orlando-real-estate-brokerages-that-provide-leads`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/is-joining-a-real-estate-team-worth-the-split`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/do-real-estate-brokerages-provide-leads`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-to-switch-real-estate-brokerages-in-florida`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/100-commission-brokerage-orlando-real-math`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog/how-much-do-orlando-real-estate-agents-make`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog/real-estate-brokerage-fees-explained`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog/questions-to-ask-before-joining-a-brokerage`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog/how-to-become-a-real-estate-agent-in-florida`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog/best-time-to-switch-real-estate-brokerages`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog/what-does-eo-insurance-cover-real-estate`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/blog/real-estate-sphere-of-influence-orlando`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/academy`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
