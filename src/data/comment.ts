// data/comments.ts
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { cacheLife, cacheTag } from "next/cache";

export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: {
    post: { select: { title: true; slug: true } };
    user: { select: { name: true; email: true; image: true } };
    _count: { select: { reports: true } };
  };
}>;

interface PaginatedComments {
  data: CommentWithRelations[];
  totalPages: number;
  total: number;
}

export const getPaginatedComments = async (
  page: number,
  limit: number,
  search: string,
  filter: string,
): Promise<PaginatedComments> => {
  "use cache";
  // Tagging with 'comments' allows us to revalidate everything,
  // while the specific tag allows more granular control.
  cacheTag(
    "comments",
    `paginated-comments-${page}-${limit}-${filter}-${search}`,
  );
  cacheLife("hours");

  try {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.CommentWhereInput = {
      AND: [
        search
          ? {
              content: { contains: search.trim(), mode: "insensitive" },
            }
          : {},
        filter === "reported" ? { reports: { some: {} } } : {},
      ],
    };

    const [data, total] = await Promise.all([
      db.comment.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: "desc" },
        include: {
          post: { select: { title: true, slug: true } },
          user: { select: { name: true, email: true, image: true } },
          _count: { select: { reports: true } },
        },
      }),
      db.comment.count({ where }),
    ]);

    return {
      data: data as CommentWithRelations[],
      total,
      totalPages: Math.ceil(total / safeLimit),
    };
  } catch {
    return {
      data: [],
      total: 0,
      totalPages: 0,
    };
  }
};
