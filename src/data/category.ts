// data/category.ts
import { CategoryWhereInput } from "@/generated/prisma/models";
import { db } from "@/lib/db";
import { CategoryWithCount } from "@/schemas";
import { cacheLife, cacheTag } from "next/cache";

interface PaginatedCategories {
  data: CategoryWithCount[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export const getCategoryBySlug = async (slug: string) => {
  try {
    return await db.category.findUnique({ where: { slug } });
  } catch {
    return null;
  }
};

export const getPaginatedCategories = async (
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedCategories> => {
  "use cache";
  cacheTag("categories", `paginated-categories-${page}-${limit}`);
  cacheLife("hours");
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const trimmedSearch = search?.trim();

    const where: CategoryWhereInput | undefined = trimmedSearch
      ? {
          OR: [
            {
              name: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined;

    const [data, total] = await Promise.all([
      db.category.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      }),
      db.category.count({ where }),
    ]);

    return {
      data: data as CategoryWithCount[],
      total,
      totalPages: Math.ceil(total / safeLimit),
      currentPage: safePage,
    };
  } catch {
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
    };
  }
};
