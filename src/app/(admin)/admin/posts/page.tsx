import PostTable from "@/components/admin/tables/post-table";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaginatedPosts } from "@/data/post";
import { PostWithRelations } from "@/schemas";
import { IconArticle } from "@tabler/icons-react";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Posts",
};

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default function PostsPage({ searchParams }: Props) {
  return (
    <div className="p-6">
      <SiteBreadcrumb
        className="mb-2"
        items={[{ label: "Posts", icon: IconArticle }]}
        isAdmin={true}
      />

      <Suspense fallback={<PostTableSkeleton />}>
        <PostTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/**
 * DATA WRAPPER COMPONENT
 * Handles the async 'await' for searchParams and Database fetching.
 */
async function PostTableWrapper({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const PAGE_SIZE = 10;

  const { data, totalPages } = await getPaginatedPosts(page, PAGE_SIZE, search);

  return (
    <PostTable
      posts={data as PostWithRelations[]}
      currentPage={page}
      totalPages={totalPages}
      search={search}
    />
  );
}

/**
 * LOADING STATE
 * UI shown while the Wrapper is fetching data.
 */
function PostTableSkeleton() {
  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="h-12 bg-muted/50 border-b border-border/50" />
        <div className="p-0">
          {[1, 2, 3, 4, 5].map((id) => (
            <div
              key={`post-skeleton-${id}`}
              className="flex items-center space-x-4 p-4 border-b border-border/20"
            >
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
