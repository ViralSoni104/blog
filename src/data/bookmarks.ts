"use server";

import { db } from "@/lib/db";
import { cacheLife, cacheTag } from "next/cache";
import { Bookmark, Post, Category } from "@/generated/prisma/client";

export interface BookmarkWithPost extends Bookmark {
  post: Post & {
    categories: Category[];
    author: {
      name: string | null;
      image: string | null;
    };
  };
}

export const getBookmarkedPosts = async (userId: string, page: number = 1) => {
  "use cache";
  cacheTag(`bookmarks-${userId}`);
  cacheLife("minutes");

  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const [bookmarks, total] = await Promise.all([
      db.bookmark.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              image: true,
              createdAt: true,
              readingTime: true,
              viewCount: true,
              categories: { select: { name: true, slug: true } },
              author: { select: { name: true, image: true } },
            },
          },
        },
      }),
      db.bookmark.count({ where: { userId } }),
    ]);

    return {
      bookmarks,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch {
    return { bookmarks: [], totalPages: 0, currentPage: 1 };
  }
};
