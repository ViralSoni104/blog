"use server";

import { db } from "@/lib/db";
import { syncCommentCache } from "@/lib/revalidate";

export async function bulkDeleteComments(ids: string[]) {
  try {
    // Look up postIds and prep revalidation before data is gone
    await syncCommentCache(ids);

    await db.comment.deleteMany({
      where: { id: { in: ids } },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete comments" };
  }
}

export async function bulkResolveReports(commentIds: string[]) {
  try {
    // Even though the comment stays, we sync to update any "reported" UI status
    await syncCommentCache(commentIds);

    await db.commentReport.deleteMany({
      where: { commentId: { in: commentIds } },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to resolve reports" };
  }
}

export async function deleteComment(id: string) {
  try {
    await syncCommentCache(id);

    await db.comment.delete({ where: { id } });

    return { success: true, message: "Comment deleted" };
  } catch {
    return { success: false, message: "Error deleting comment" };
  }
}
