import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Monitor watched datasets: trust score drift, license changes, and audit-ready compliance reports. Demo view with sample data.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
