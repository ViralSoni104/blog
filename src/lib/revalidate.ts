import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

/**
 * Ensures both the admin dashboard and public post threads are updated
 * @param commentIds - A single comment ID or an array of IDs
 */
export async function syncCommentCache(commentIds: string | string[]) {
  const ids = Array.isArray(commentIds) ? commentIds : [commentIds];

  // 1. Fetch the unique postIds associated with these comments
  const comments = await db.comment.findMany({
    where: { id: { in: ids } },
    select: { postId: true },
  });

  const uniquePostIds = Array.from(new Set(comments.map((c) => c.postId)));

  // 2. Clear the global admin dashboard tag
  revalidateTag("comments", "max");

  // 3. Clear the specific post threads
  uniquePostIds.forEach((postId) => {
    revalidateTag(`comments-${postId}`, "max");
  });
}
