import type { Metadata } from "next";

import DashboardOverview from "@/components/finance/DashboardOverview";

export const metadata: Metadata = {
  title: "Dashboard | Finance Tracker",
  description: "Finance summary dashboard backed by FastAPI",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
