import { db } from "@/lib/db";

// 💡 1. Define the exact shape of the data we expect
type SitemapItem = {
  slug: string;
  updatedAt: Date;
};

// 💡 2. Tell TypeScript this function will ALWAYS return a tuple of two SitemapItem arrays
export const getSitemapData = async (): Promise<
  [SitemapItem[], SitemapItem[]]
> => {
  try {
    return await Promise.all([
      db.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);
  } catch {
    // 💡 3. TypeScript now knows exactly what these empty arrays represent!
    return [[], []];
  }
};
