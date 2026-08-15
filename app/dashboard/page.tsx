// app/dashboard/page.tsx
//
// The Recruit Dashboard is retired (Tom, 2026-08-14). Everything it did now
// lives in the operating system at bearteam.app:
//   - prospects census + skip trace: /portal/recruiting/prospects
//   - pipeline board:                /portal/recruiting
// The leads table this page read was migrated to BT-OS the same day. The
// public landing site, Scout chat, the booking webhook and the no-show
// follow-up all remain live in this repo.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function RetiredDashboard() {
  redirect("https://bearteam.app/portal/recruiting");
}
