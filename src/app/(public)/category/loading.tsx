import { ContainerSection } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCategories() {
  return (
    <ContainerSection className="flex w-full flex-col">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2 mb-10 mt-4">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-5 w-64 rounded-md opacity-60" />
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    </ContainerSection>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-muted/20 p-5">
      {/* Icon/Image Skeleton */}
      <Skeleton className="mb-4 size-12 rounded-2xl" />

      <div className="space-y-3">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4 rounded-md" />

        {/* Description Skeletons */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>

        {/* Footer/Count Skeleton */}
        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
