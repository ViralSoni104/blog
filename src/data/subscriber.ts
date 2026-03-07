import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";

export const getPaginatedSubscribers = async (
  page: number,
  limit: number,
  search?: string,
) => {
  "use cache";
  cacheTag("subscribers", `paginated-subscribers-${page}-${limit}`);
  cacheLife("minutes");
  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where = search
      ? {
          email: { contains: search, mode: "insensitive" as Prisma.QueryMode },
        }
      : {};

    const [data, total] = await Promise.all([
      db.subscriber.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
      }),
      db.subscriber.count({ where }),
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / safeLimit),
      currentPage: safePage,
    };
  } catch {
    return { data: [], total: 0, totalPages: 0, currentPage: 1 };
  }
};

export const getSubscriberByEmail = async (email: string) => {
  try {
    const subscriber = await db.subscriber.findUnique({
      where: { email },
    });
    return subscriber;
  } catch {
    return null;
  }
};
