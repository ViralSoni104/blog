import { Suspense } from "react";
import { currentUser } from "@/lib/auth";
import { getInfinitePosts, getPopularCategories } from "@/actions/post-action";
import ArticlesSection from "@/components/sections/articles-section";
import { ContainerSection } from "@/components/ui/container";
import { Metadata } from "next";
import { site } from "@/site";
import { redirect } from "next/navigation";
import ArticlesLoadingSkeleton from "@/app/(public)/articles/loading";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Browse tutorials, thoughts, and deep dives on modern web development, React, Next.js, and code logic.",
  openGraph: {
    title: `Articles · ${site.name}`,
    description:
      "Browse tutorials, thoughts, and deep dives on modern web development, React, Next.js, and code logic.",
    url: `${site.url}/articles`,
  },
};

export default function ArticlesPage(props: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  return (
    <ContainerSection className="flex w-full flex-col gap-0 min-h-screen">
      {/* 1. Page shell renders instantly. Suspense catches the delay. */}
      <Suspense fallback={<ArticlesLoadingSkeleton />}>
        {/* 2. Pass the PROMISE directly down, do NOT await it here. */}
        <DynamicArticlesContent searchParams={props.searchParams} />
      </Suspense>
    </ContainerSection>
  );
}

async function DynamicArticlesContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>; // Accept the Promise
}) {
  // 3. 💡 Await the Promise INSIDE Suspense, BEFORE calling auth or DB.
  // This opts the component into dynamic rendering perfectly.
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const category = resolvedParams.category || "All";

  // 4. Now safe to call because Next.js knows we are in a dynamic context
  const user = await currentUser();

  const [postsRes, categories] = await Promise.all([
    getInfinitePosts(page, 12, category, user?.id),
    getPopularCategories(8),
  ]);
  const validMaxPage = Math.max(1, postsRes.totalPages);

  // If the requested page is greater than the valid max page, redirect!
  if (page > validMaxPage) {
    const params = new URLSearchParams();
    params.set("category", category);

    // Redirect them to the last valid page (or page 1 if empty)
    params.set("page", validMaxPage.toString());

    redirect(`/articles?${params.toString()}`);
  }
  return (
    <ArticlesSection
      initialArticles={postsRes.data}
      initialTotalPages={postsRes.totalPages}
      currentPage={page}
      categories={categories}
      initialCategory={category}
      userId={user?.id}
    />
  );
}
