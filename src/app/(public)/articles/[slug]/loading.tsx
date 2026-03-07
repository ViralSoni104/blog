import { ContainerSection } from "@/components/ui/container";

export default function ArticleLoading() {
  return (
    <ContainerSection className="flex w-full flex-col gap-6 md:gap-8 pb-12 overflow-hidden max-w-full animate-pulse mt-8">
      {/* Breadcrumb Skeleton */}
      <div className="w-full flex justify-start md:justify-center">
        <div className="h-4 w-48 bg-muted rounded-md" />
      </div>

      {/* Header Skeleton */}
      <header className="flex flex-col items-start md:items-center text-left md:text-center max-w-3xl mx-auto space-y-6 w-full mt-4">
        {/* Category Pill Skeleton */}
        <div className="h-6 w-24 bg-muted rounded-full" />

        {/* Title Skeletons */}
        <div className="h-12 md:h-16 w-full bg-muted rounded-xl" />
        <div className="h-12 md:h-16 w-3/4 bg-muted rounded-xl" />

        {/* Excerpt Skeleton */}
        <div className="h-6 w-full bg-muted rounded-md mt-4" />
        <div className="h-6 w-5/6 bg-muted rounded-md" />

        {/* Author Metadata Skeleton */}
        <div className="h-10 w-3/4 md:w-1/2 bg-muted rounded-md mt-6" />
      </header>

      {/* Cover Image Skeleton */}
      <div className="w-full max-w-5xl mx-auto aspect-video rounded-xl md:rounded-3xl bg-muted mt-6" />

      {/* Article Body Skeleton */}
      <div className="max-w-3xl mx-auto w-full px-2 md:px-0 space-y-4 mt-8">
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-4 w-full bg-muted rounded-md" />
        <div className="h-4 w-5/6 bg-muted rounded-md" />
        <div className="h-4 w-full bg-muted rounded-md mt-4" />
        <div className="h-4 w-4/5 bg-muted rounded-md" />
      </div>
    </ContainerSection>
  );
}
