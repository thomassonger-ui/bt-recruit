import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.joinbearteam.com";
const TITLE =
  "Join Bear Team — Orlando Real Estate Brokerage for Agents";
const DESCRIPTION =
  "Orlando real estate brokerage built for agents: 60/40 to 90/10 commission splits, $0 monthly fees, $150 per closing, E&O covered, and Scout AI to run your pipeline.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Bear Team Real Estate",
  },
  description: DESCRIPTION,
  applicationName: "Bear Team Real Estate",
  keywords: [
    "join a real estate team Orlando",
    "real estate brokerage Orlando for agents",
    "switch brokerage Orlando",
    "90/10 commission split brokerage",
    "no monthly fee real estate brokerage",
    "best brokerage for agents Orlando",
    "real estate agent recruiting Orlando",
    "Bear Team Real Estate",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Bear Team Real Estate",
    title: "Join Bear Team — Orlando Brokerage Built for Agents",
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Bear Team Real Estate — Orlando brokerage for agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Bear Team — Orlando Brokerage Built for Agents",
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "real estate",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Bear Team Real Estate",
  url: SITE_URL,
  logo: `${SITE_URL}/bt-logo-mark.svg`,
  image: `${SITE_URL}/og.png`,
  description:
    "Boutique Orlando real estate brokerage recruiting licensed agents — progressive 60/40 to 90/10 commission splits, zero monthly fees, $150 flat per closing, E&O covered, and Scout AI to run your pipeline.",
  slogan: "Stop paying into a cap you never hit.",
  areaServed: {
    "@type": "City",
    name: "Orlando",
    containedInPlace: { "@type": "State", name: "Florida" },
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "2300 S Crystal Lake Dr",
    addressLocality: "Orlando",
    addressRegion: "FL",
    postalCode: "32806",
    addressCountry: "US",
  },
  telephone: "+1-407-228-1112",
  founder: {
    "@type": "Person",
    name: "Bethanne Baer",
    jobTitle: "Broker / Owner",
  },
  knowsAbout: [
    "real estate agent recruiting",
    "commission splits",
    "brokerage onboarding",
    "Orlando real estate market",
  ],
  parentOrganization: {
    "@type": "Organization",
    name: "Bear Team Real Estate",
    url: "https://bearteam.app",
    logo: `${SITE_URL}/bt-logo-mark.svg`,
  },
  sameAs: ["https://bearteam.app"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
