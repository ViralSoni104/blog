import { getPaginatedSubscribers } from "@/data/subscriber";
import SubscriberTable from "@/components/admin/tables/subscriber-table";
import { Metadata } from "next";
import { Subscriber } from "@/generated/prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Subscribers",
};

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  return (
    <div className="p-6">
      <Suspense fallback={<SubscriberTableSkeleton />}>
        <SubscriberTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SubscriberTableWrapper({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const query = params.search || "";
  const PAGE_SIZE = 10;

  const { data, totalPages } = await getPaginatedSubscribers(
    currentPage,
    PAGE_SIZE,
    query,
  );

  return (
    <SubscriberTable
      subscribers={data as Subscriber[]}
      currentPage={currentPage}
      totalPages={totalPages}
      search={query}
    />
  );
}

/**
 * SKELETON LOADER
 */
function SubscriberTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div
            key={`sub-skeleton-${id}`}
            className="flex items-center space-x-4 p-4 border-b border-border/10"
          >
            <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2 opacity-50" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
