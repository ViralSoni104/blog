"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath, updateTag } from "next/cache";
import {
  commentSchema,
  updateCommentSchema,
  reportCommentSchema,
  type CommentInput,
  type UpdateCommentInput,
  type ReportCommentInput,
} from "@/schemas"; // Adjust import path if needed
import { cacheTag, cacheLife } from "next/cache";
import { checkRateLimit } from "@/lib/utils";
import { commentLimiter, reportLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";
// --- 💡 1. EXPORT STRICT TYPES FOR THE FRONTEND ---
export type CommentUser = {
  id: string;
  name: string | null;
  image: string | null;
};

export type CommentTreeItem = {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  postId: string;
  userId: string;
  user: CommentUser;
  replies: CommentTreeItem[];
};

export async function getCommentsTree(
  postId: string,
): Promise<CommentTreeItem[]> {
  "use cache";
  // 💡 2. Tag it specifically for THIS post
  cacheTag(`comments-${postId}`);
  cacheLife("hours");
  try {
    const flatComments = await db.comment.findMany({
      where: { postId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: "asc" },
    });

    const commentMap = new Map<string, CommentTreeItem>();
    const rootComments: CommentTreeItem[] = [];

    flatComments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      } as CommentTreeItem);
    });

    flatComments.forEach((comment) => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) parent.replies.push(commentMap.get(comment.id)!);
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments.reverse();
  } catch {
    return [];
  }
}

// --- 💡 2. USE ZOD INPUTS IN ACTIONS ---
export async function addComment(input: CommentInput, pathname: string) {
  const user = await currentUser();
  if (!user?.id) return { success: false, message: "Unauthorized" };

  const rateLimitRes = await checkRateLimit(commentLimiter, headers, user.id);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: "Slow down! You're commenting too fast. Try again in a minute.",
    };

  const parsed = commentSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: "Invalid Comment!",
      errors: parsed.error.message,
    };

  try {
    await db.comment.create({
      data: {
        content: parsed.data.content.trim(),
        postId: parsed.data.postId,
        userId: user.id,
        parentId: parsed.data.parentId || null,
      },
    });
    updateTag(`comments-${parsed.data.postId}`);
    updateTag(`stats-${parsed.data.postId}`);
    updateTag("comments");
    revalidatePath(pathname);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to post comment." };
  }
}

export async function editComment(input: UpdateCommentInput, pathname: string) {
  const user = await currentUser();
  if (!user?.id) return { success: false, message: "Unauthorized" };

  const rateLimitRes = await checkRateLimit(commentLimiter, headers, user.id);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: "Slow down! You're commenting too fast. Try again in a minute.",
    };

  const parsed = updateCommentSchema.safeParse(input);
  if (!parsed.success)
    return {
      success: false,
      message: "Invalid Comment!",
      errors: parsed.error.message,
    };

  try {
    const comment = await db.comment.findUnique({
      where: { id: parsed.data.commentId },
      select: { userId: true, postId: true },
    });
    if (!comment) return { success: false, message: "Comment not found." };
    if (comment?.userId !== user.id)
      return { success: false, message: "Not your comment." };

    await db.comment.update({
      where: { id: parsed.data.commentId },
      data: { content: parsed.data.content.trim() },
    });
    updateTag(`comments-${comment.postId}`);
    updateTag(`stats-${comment.postId}`);
    updateTag("comments");
    revalidatePath(pathname);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to edit comment." };
  }
}

export async function reportComment(
  input: ReportCommentInput,
  pathname: string,
) {
  const user = await currentUser();
  if (!user?.id) return { success: false, message: "Unauthorized" };

  const rateLimitRes = await checkRateLimit(reportLimiter, headers, user.id);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message:
        "You've submitted several reports recently. Please wait a while before reporting more.",
    };

  // 1. Validate input against your Zod schema
  const parsed = reportCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid Report!",
      errors: parsed.error.message,
    };
  }

  try {
    // 2. Check if this user has already reported this specific comment
    const existingReport = await db.commentReport.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: parsed.data.commentId,
        },
      },
    });

    if (existingReport) {
      return {
        success: false,
        message: "You have already reported this comment.",
      };
    }

    // 3. Save the report to the database
    await db.commentReport.create({
      data: {
        commentId: parsed.data.commentId,
        userId: user.id,
        reason: parsed.data.reason,
      },
    });
    updateTag("comments");
    revalidatePath(pathname);
    return {
      success: true,
      message: "Comment reported. Thank you for keeping the community safe.",
    };
  } catch {
    return {
      success: false,
      message: "Failed to submit report. Please try again.",
    };
  }
}

export async function deleteComment(commentId: string, pathname: string) {
  const user = await currentUser();
  if (!user?.id) return { success: false, message: "Unauthorized" };

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    });
    if (!comment) return { success: false, message: "Comment not found." };
    if (comment?.userId !== user.id)
      return { success: false, message: "Invalid action!" };

    await db.comment.delete({ where: { id: commentId } });

    updateTag(`comments-${comment.postId}`);
    updateTag("comments");
    updateTag(`stats-${comment.postId}`);
    revalidatePath(pathname);
    return { success: true };
  } catch {
    return { success: false, message: "Failed to delete comment." };
  }
}
