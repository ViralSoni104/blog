import { Suspense } from "react";
import {
  getInfinitePosts,
  getPopularCategories,
  getTrendingPosts,
} from "@/actions/post-action";
import { currentUser } from "@/lib/auth";
import Hero from "@/components/sections/hero-section";
import LatestArticles from "@/components/sections/latest-articles";
import Newsletter from "@/components/sections/newsletter-section";
import TrendingArticles from "@/components/sections/trending-articles";

export default function Page() {
  return (
    <div className="flex flex-col">
      {/* Wrap dynamic content in Suspense to allow the shell to load instantly */}
      <Suspense fallback={<HomeSkeleton />}>
        <DynamicHomeContent />
      </Suspense>
      <Newsletter />
    </div>
  );
}

async function DynamicHomeContent() {
  // Fetch user and data inside the Suspended component
  // const user = await currentUser();

  // const [postsRes, popularCategories, trendingPosts] = await Promise.all([
  //   getInfinitePosts(1, 12, "All", user?.id),
  //   getPopularCategories(8),
  //   getTrendingPosts(6, user?.id),
  // ]);
  const popularCategoriesPromise = getPopularCategories(8);
  const user = await currentUser();
  const [postsRes, popularCategories, trendingPosts] = await Promise.all([
    getInfinitePosts(1, 12, "All", user?.id),
    popularCategoriesPromise,
    getTrendingPosts(6, user?.id),
  ]);
  if (!postsRes?.data || postsRes.data.length === 0) {
    return <div className="py-20 text-center">No articles found.</div>;
  }
  return (
    <>
      <Hero latestArticleSlug={postsRes.data[0]!.slug} />
      <TrendingArticles articles={trendingPosts} />
      <LatestArticles
        articles={postsRes.data} // 💡 Simplified prop
        popularCategories={popularCategories}
        // 💡 Removed initialTotalPages and userId
      />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="container space-y-10 py-10 px-4 md:px-8">
      <div className="h-64 bg-muted animate-pulse rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((id) => (
          <div
            key={`home-article-skeleton-${id}`}
            className="h-80 bg-muted animate-pulse rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
