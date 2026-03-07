"use server";

import { db } from "@/lib/db";
// src/actions/search-action.ts
import { Prisma } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";

export type AdvancedSearchResult = Prisma.PostGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    excerpt: true;
    image: true;
    createdAt: true;
    viewCount: true;
    readingTime: true;
    categories: { select: { name: true; slug: true } };
    author: { select: { name: true; image: true } };
  };
}>;

// 💡 2. Strict Type for Categories
export type AdvancedSearchCategoryResult = Prisma.CategoryGetPayload<{
  include: {
    _count: { select: { posts: true } };
  };
}>;

export async function advancedSearchPosts(
  query: string,
  page: number = 1,
  limit: number = 12,
  sortBy: string = "newest",
) {
  "use cache";
  cacheTag("search", "posts");
  cacheLife("minutes");

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;
  const searchTerm = query.trim();

  const where: Prisma.PostWhereInput = {
    published: true,
    ...(searchTerm && {
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { excerpt: { contains: searchTerm, mode: "insensitive" } },
      ],
    }),
  };

  let orderBy: Prisma.PostOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "oldest") orderBy = { createdAt: "asc" };
  if (sortBy === "popular") orderBy = { viewCount: "desc" };

  try {
    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
          createdAt: true,
          viewCount: true,
          readingTime: true,
          categories: { select: { name: true, slug: true } },
          author: { select: { name: true, image: true } },
        },
      }),
      db.post.count({ where }),
    ]);

    return {
      data: posts as AdvancedSearchResult[],
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch {
    return { data: [], totalPages: 0, totalItems: 0 };
  }
}

// 💡 3. New Database Query specifically for Categories
export async function advancedSearchCategories(
  query: string,
  page: number = 1,
  limit: number = 12,
) {
  "use cache";
  cacheTag("search", "categories");
  cacheLife("minutes");

  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * limit;
  const searchTerm = query.trim();

  const where: Prisma.CategoryWhereInput = searchTerm
    ? {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
        ],
      }
    : {};

  try {
    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { posts: { _count: "desc" } }, // Always show most popular categories first
        // Strict select to match the AdvancedSearchCategoryResult type
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          _count: { select: { posts: true } },
        },
      }),
      db.category.count({ where }),
    ]);

    return {
      data: categories as AdvancedSearchCategoryResult[],
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch {
    return { data: [], totalPages: 0, totalItems: 0 };
  }
}

// 💡 Strictly type the exact fields we need to keep the network payload tiny
export type SearchResult = {
  posts: Array<{ id: string; title: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
};

export async function globalSearch(query: string): Promise<SearchResult> {
  "use cache";
  cacheTag("search", "global");
  cacheLife("minutes");
  const searchTerm = query.trim();

  // Return empty immediately if the query is too short (saves database load)
  if (searchTerm.length < 2) {
    return { posts: [], categories: [] };
  }

  try {
    // ⚡ Execute both queries to the database at the exact same time
    const [posts, categories] = await Promise.all([
      db.post.findMany({
        where: {
          published: true, // Never expose drafts in search
          title: {
            contains: searchTerm,
            mode: "insensitive", // Case-insensitive search
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
        },
        take: 5, // 💡 Strictly limit to top 5 results
        orderBy: {
          viewCount: "desc", // Show the most popular matching posts first
        },
      }),
      db.category.findMany({
        where: {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 5, // 💡 Strictly limit to top 5 results
      }),
    ]);

    return { posts, categories };
  } catch {
    // Graceful fallback if the database fails
    return { posts: [], categories: [] };
  }
}
