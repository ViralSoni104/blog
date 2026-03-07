import { IconLoader2 } from "@tabler/icons-react";

export default function ArticlesLoadingSkeleton() {
  return (
    <div className="space-y-8 py-10">
      <div className="space-y-3">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-full max-w-xl bg-muted animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div key={`article-skeleton-${id}`} className="space-y-4">
            <div className="aspect-[16/10] w-full bg-muted animate-pulse rounded-2xl" />
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex justify-center py-10">
        <IconLoader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    </div>
  );
}
