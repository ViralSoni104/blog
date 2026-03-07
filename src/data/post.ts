// src/data/post.ts
import { db } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";

export const getPaginatedPosts = async (
  page: number,
  limit: number,
  search?: string,
) => {
  "use cache";
  cacheTag("posts", `paginated-posts-${page}-${limit}`);
  cacheLife("hours");
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [data, total] = await Promise.all([
    db.post.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        published: true,
        viewCount: true,
        createdAt: true,
        categories: { select: { id: true, name: true } },
        author: { select: { name: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  return {
    data,
    totalPages: Math.ceil(total / safeLimit),
    currentPage: safePage,
  };
};

export const getPostById = (id: string) =>
  db.post.findUnique({
    where: { id },
    include: {
      categories: true,
    },
  });

export const getAllCategories = () =>
  db.category.findMany({
    orderBy: { name: "asc" },
  });
