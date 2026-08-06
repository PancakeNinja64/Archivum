import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/server/auth";
import { AdminClient } from "@/components/admin/AdminClient";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin.ok) redirect(admin.status === 401 ? "/login/" : "/");
  return <AdminClient adminEmail={admin.email} />;
}
