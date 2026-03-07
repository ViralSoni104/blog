"use server";

import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { cacheTag, cacheLife } from "next/cache";
import { currentUser } from "@/lib/auth";

export type PublicPost = Prisma.PostGetPayload<{
  include: {
    author: { select: { name: true; image: true } };
    categories: { select: { name: true; slug: true } };
    bookmarks: { select: { id: true } };
  };
}> & { isBookmarked?: boolean };

async function getCachedPublicPosts(
  page: number,
  limit: number,
  categorySlug: string,
) {
  "use cache";
  cacheTag("posts", `infinite-posts-${categorySlug}-${page}-${limit}`);
  cacheLife("hours");

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;

  const where: Prisma.PostWhereInput = {
    published: true,
    ...(categorySlug !== "All" && {
      categories: { some: { slug: categorySlug } },
    }),
  };

  // We use `select` instead of `include` for maximum performance,
  // stripping out heavy text fields if they aren't needed in the card.
  return Promise.all([
    db.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        createdAt: true,
        viewCount: true,
        readingTime: true,
        author: { select: { name: true, image: true } },
        categories: { select: { name: true, slug: true } },
      },
    }),
    db.post.count({ where }),
  ]);
}

// 💡 2. MAIN ACTION: This handles the dynamic, user-specific data.
// It is NOT cached globally, but it's lightning fast because the heavy lifting
// is done by the cached function above.
export async function getInfinitePosts(
  page: number,
  limit: number = 12,
  categorySlug: string = "All",
  userId?: string,
) {
  try {
    // 1. Instantly fetch the public posts from the Next.js edge cache
    const [data, total] = await getCachedPublicPosts(page, limit, categorySlug);

    // 2. If a user is logged in, fetch ONLY their bookmarks for these specific posts
    let userBookmarkedPostIds = new Set<string>();

    if (userId && data.length > 0) {
      const postIds = data.map((p) => p.id);

      const bookmarks = await db.bookmark.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });

      // Store in a Set for O(1) instant lookup time
      userBookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));
    }

    // 3. Merge the dynamic user state into the cached public posts
    const posts = data.map((post) => ({
      ...post,
      isBookmarked: userBookmarkedPostIds.has(post.id),
    }));

    return {
      data: posts as PublicPost[], // Cast to your PublicPost type if needed
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch {
    return { data: [], totalPages: 0, totalItems: 0 };
  }
}

export async function getPopularCategories(limit: number = 8) {
  "use cache";
  cacheTag("categories", "popular-categories");
  cacheLife("hours");

  try {
    return await db.category.findMany({
      take: limit,
      orderBy: { posts: { _count: "desc" } },
      select: { name: true, slug: true },
    });
  } catch {
    return [];
  }
}

async function getCachedTrendingPosts(limit: number) {
  "use cache";
  cacheTag("posts", "trending");
  cacheLife("hours");

  return await db.post.findMany({
    where: { published: true },
    take: limit,
    orderBy: { viewCount: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      image: true,
      createdAt: true,
      viewCount: true,
      readingTime: true,
      author: { select: { name: true, image: true } },
      categories: { select: { name: true, slug: true } },
    },
  });
}

export async function getTrendingPosts(limit: number = 6, userId?: string) {
  // 💡 Fixed missing optional flag here too
  try {
    const data = await getCachedTrendingPosts(limit);

    let userBookmarkedPostIds = new Set<string>();

    // Fast O(1) bookmark injection
    if (userId && data.length > 0) {
      const postIds = data.map((p) => p.id);
      const bookmarks = await db.bookmark.findMany({
        where: { userId, postId: { in: postIds } },
        select: { postId: true },
      });
      userBookmarkedPostIds = new Set(bookmarks.map((b) => b.postId));
    }

    const posts = data.map((post) => ({
      ...post,
      isBookmarked: userBookmarkedPostIds.has(post.id),
    }));

    return posts as PublicPost[];
  } catch {
    return [];
  }
}

export async function getArticleMeta(slug: string) {
  "use cache";
  cacheTag("posts", `post-${slug}`);
  cacheLife("hours");

  return await db.post.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      image: true,
      createdAt: true,
    },
  });
}

export async function getPublicArticleBySlug(slug: string) {
  "use cache";
  cacheTag("posts", `post-${slug}`);
  cacheLife("hours");

  return await db.post.findUnique({
    where: { slug },
    include: {
      author: true,
      categories: true,
    },
  });
}

export async function getArticleStats(postId: string) {
  "use cache";
  cacheTag(`stats-${postId}`);
  cacheLife("minutes");

  const stats = await db.post.findUnique({
    where: { id: postId },
    select: {
      viewCount: true,
      shareCount: true,
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });

  return stats;
}

export async function getUserArticleEngagement(postId: string) {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return {
      initialIsLiked: false,
      initialIsBookmarked: false,
      isLoggedIn: false,
      currentUserId: null,
    };
  }

  const postEngagement = await db.post.findUnique({
    where: { id: postId },
    select: {
      likes: { where: { userId } },
      bookmarks: { where: { userId } },
    },
  });

  return {
    initialIsLiked: postEngagement?.likes && postEngagement.likes.length > 0,
    initialIsBookmarked:
      postEngagement?.bookmarks && postEngagement.bookmarks.length > 0,
    isLoggedIn: true,
    currentUserId: userId,
  };
}

export async function getPostsForRSS(limit: number = 50) {
  "use cache";
  cacheTag("posts", "rss");
  cacheLife("hours");

  try {
    return await db.post.findMany({
      where: { published: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}
