import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "BearTeam Academy — Real Estate Training for Orlando Agents",
  description:
    "BearTeam Academy gives Orlando agents structured real estate training, scripts, and a 30-60-90 day plan — the coaching system behind Bear Team's production.",
  alternates: { canonical: "/academy" },
};

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return children;
}
