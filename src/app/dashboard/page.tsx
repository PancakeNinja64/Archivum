import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your saved datasets: coverage movement, licence changes, and new versions as documented at the source.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
