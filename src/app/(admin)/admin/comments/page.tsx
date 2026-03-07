import CommentTable from "@/components/admin/tables/comment-table";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaginatedComments } from "@/data/comment";
import { IconMessage } from "@tabler/icons-react";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Comments",
};

interface Props {
  searchParams: Promise<{ page?: string; search?: string; filter?: string }>;
}

export default function CommentPage({ searchParams }: Props) {
  return (
    <div className="p-6 space-y-4">
      <SiteBreadcrumb
        className="mb-2"
        items={[{ label: "Comments", icon: IconMessage }]}
        isAdmin={true}
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Comment Moderation
        </h1>
        <p className="text-sm text-muted-foreground">
          Review reported content and manage user discussions.
        </p>
      </div>

      <Suspense fallback={<CommentTableSkeleton />}>
        <CommentTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CommentTableWrapper({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const filter = params.filter || "reported";
  const PAGE_SIZE = 10;

  const { data, totalPages } = await getPaginatedComments(
    page,
    PAGE_SIZE,
    search,
    filter,
  );

  return (
    <CommentTable
      comments={data}
      currentPage={page}
      totalPages={totalPages}
      search={search}
      filter={filter}
    />
  );
}

function CommentTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-64 rounded-xl" />
      </div>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div
            key={`comment-skeleton-${id}`}
            className="flex items-center space-x-4 p-4 border-b border-border/20"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
