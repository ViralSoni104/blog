"use server";

import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { CategoryWithCount } from "@/schemas";
import { cacheTag, cacheLife } from "next/cache";

function getOrderBy(sortBy: string): Prisma.CategoryOrderByWithRelationInput {
  switch (sortBy) {
    case "oldest":
      return { createdAt: "asc" };
    case "readTimeHL":
      return { posts: { _count: "desc" } };
    case "readTimeLH":
      return { posts: { _count: "asc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function getInfiniteCategories(
  page: number,
  limit: number = 12,
  sortBy: string = "newest",
) {
  "use cache";
  cacheTag("categories", `infinite-${page}-${limit}-${sortBy}`);
  cacheLife("minutes");

  try {
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * limit;

    // Fetch data and total count simultaneously for precise pagination math
    const [data, total] = await Promise.all([
      db.category.findMany({
        skip,
        take: limit, // Only take the exact limit
        orderBy: getOrderBy(sortBy),
        include: {
          _count: { select: { posts: true } },
        },
      }),
      db.category.count(), // Get total number of categories
    ]);

    return {
      data: data as CategoryWithCount[],
      totalPages: Math.ceil(total / limit),
    };
  } catch {
    return { data: [], totalPages: 0 };
  }
}
