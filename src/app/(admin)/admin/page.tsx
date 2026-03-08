import { getDashboardAnalytics } from "@/data/admin-analytics";
import DashboardClient from "@/components/admin/ui/dashboard-client";
import { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { IconReportAnalytics } from "@tabler/icons-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react"; // 💡 1. Import Suspense

export const metadata: Metadata = {
  title: "Admin | Dashboard",
};

// 💡 2. The Async Loader: Handles cookies (auth) and DB queries
async function DashboardLoader() {
  const session = await auth();

  // Kick out non-admins
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const stats = await getDashboardAnalytics();

  return <DashboardClient stats={stats} />;
}

// 💡 3. The Page Shell: No 'async', renders instantly!
export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* This renders instantly, keeping the layout fast */}
      <SiteBreadcrumb
        className="mb-2"
        items={[{ label: "Analytics", icon: IconReportAnalytics }]}
        isAdmin={true}
      />

      {/* 💡 4. Suspend the auth check and data fetch */}
      <Suspense
        fallback={
          <div className="h-[400px] w-full animate-pulse bg-muted/50 rounded-xl border border-border mt-4" />
        }
      >
        <DashboardLoader />
      </Suspense>
    </div>
  );
}
