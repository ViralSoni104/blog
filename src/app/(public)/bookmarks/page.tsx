import { Suspense } from "react";
import { currentUser } from "@/lib/auth";
import { getBookmarkedPosts, type BookmarkWithPost } from "@/data/bookmarks"; // 💡 Import the strict type
import { IconBookmark } from "@tabler/icons-react";
import { ContainerSection } from "@/components/ui/container";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import BookmarksSection from "@/components/sections/bookmark-section";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "Browse your bookmarked articles.",
  robots: { index: false, follow: false },
};

export default function BookmarksPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <ContainerSection className="container md:mt-0 mt-5 max-w-7xl ">
      <SiteBreadcrumb
        items={[{ label: "Bookmarks", icon: IconBookmark }]}
        className="mb-2"
      />

      <Suspense fallback={<BookmarksLoading />}>
        {/* Pass the Promise directly into the suspended component */}
        <BookmarksList searchParams={props.searchParams} />
      </Suspense>
    </ContainerSection>
  );
}

async function BookmarksList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const user = await currentUser();

  if (!user) {
    return (
      <div className="py-24 text-center border-2 border-dashed border-muted rounded-[2rem]">
        <h2 className="text-xl font-bold">Auth Required</h2>
        <p className="text-muted-foreground mt-2 italic font-medium">
          Please sign in to view your bookmarks.
        </p>
      </div>
    );
  }

  const { bookmarks, totalPages } = await getBookmarkedPosts(user.id, page);

  // 💡 Use a strict type assertion instead of 'any'
  return (
    <BookmarksSection
      initialBookmarks={bookmarks as BookmarkWithPost[]}
      initialTotalPages={totalPages}
      currentPage={page}
      userId={user.id}
    />
  );
}

function BookmarksLoading() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((id) => (
        <div
          className="space-y-4 animate-pulse"
          key={`bookmark-skeleton-${id}`}
        >
          <div className="aspect-[16/10] w-full bg-muted rounded-3xl" />
          <div className="h-6 w-3/4 bg-muted rounded-lg" />
          <div className="h-4 w-full bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
