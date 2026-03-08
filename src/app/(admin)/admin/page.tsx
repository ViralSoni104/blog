import { getDashboardAnalytics } from "@/data/admin-analytics";
import DashboardClient from "@/components/admin/ui/dashboard-client";
import { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { IconReportAnalytics } from "@tabler/icons-react";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | Dashboard",
};

export default async function AdminPage() {
  const stats = await getDashboardAnalytics();
  const loggedInUser = await currentUser();
  if (!loggedInUser || loggedInUser.role !== "ADMIN") redirect("/");
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <SiteBreadcrumb
        className="mb-2"
        items={[{ label: "Analytics", icon: IconReportAnalytics }]}
        isAdmin={true}
      />
      <DashboardClient stats={stats} />
    </div>
  );
}
