import type { Metadata } from "next";
import RecruitingClient from "./RecruitingClient";

export const metadata: Metadata = {
  title: "The System — Scout AI & BearTeamOS for Orlando Agents",
  description:
    "Scout and BearTeamOS are the system behind Bear Team agents in Orlando — AI that answers split, fee, and cap questions and runs your pipeline so you always know the next step.",
  alternates: { canonical: "/scout" },
};

export default function RecruitingPage() {
  return <RecruitingClient />;
}
