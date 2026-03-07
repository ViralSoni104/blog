"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { interactionLimiter } from "@/lib/rate-limit";
import { revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";

async function getSecureUserId() {
  const user = await currentUser();
  return user?.id || null;
}

// 💡 Helper to get an identifier for anonymous users (used for sharing)
async function getClientIp() {
  const headersList = await headers();
  // Vercel/Next.js standard headers for capturing client IP
  return (
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "anonymous"
  );
}

// --- VIEW ACTION (No auth required) ---
export async function incrementViewCount(postId: string) {
  try {
    // Next.js 15+ recommends awaiting cookies()
    const cookieStore = await cookies();
    const cookieName = `viewed_post_${postId}`;

    // 1. Check if the user has already viewed this post recently
    if (cookieStore.has(cookieName)) {
      return { success: true, message: "Already counted" };
    }

    // 2. If not, increment the database
    await db.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    // 3. Set the cookie to prevent counting again for 24 hours (86400 seconds)
    cookieStore.set(cookieName, "true", {
      maxAge: 86400,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}

// --- SHARE ACTION (No auth required) ---
export async function incrementShareCount(postId: string) {
  try {
    const ip = await getClientIp();
    const { success: allowed } = await interactionLimiter.limit(`share_${ip}`);

    if (!allowed) {
      return {
        success: false,
        shares: 0,
        message: "Too many shares. Please try after sometime!.",
      };
    }
    const post = await db.post.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } },
    });
    revalidateTag(`stats-${postId}`, "max");
    return { success: true, shares: post.shareCount };
  } catch {
    return { success: false, shares: 0 };
  }
}

// --- LIKE ACTION (Secure Auth Check) ---
export async function toggleLike(postId: string, action: "like" | "unlike") {
  const userId = await getSecureUserId();

  if (!userId) {
    return { success: false, message: "Unauthorized", isLiked: false };
  }

  try {
    const { success: allowed } = await interactionLimiter.limit(
      `like_${userId}`,
    );
    if (!allowed) {
      // Return previous state so the UI reverts, and show the rate limit message
      return {
        success: false,
        message: "Too many actions. Please slow down.",
        isLiked: action === "unlike",
      };
    }
    if (action === "unlike") {
      await db.like.deleteMany({
        where: { postId, userId },
      });
    } else {
      await db.like.upsert({
        where: { postId_userId: { postId, userId } },
        create: { postId, userId },
        update: {},
      });
    }

    revalidateTag(`stats-${postId}`, "max");
    return { success: true, isLiked: action === "like" };
  } catch {
    return { success: false, message: "Database error", isLiked: false };
  }
}

// --- BOOKMARK ACTION (Secure Auth Check) ---
export async function toggleBookmark(
  postId: string,
  action: "bookmark" | "unbookmark",
) {
  const userId = await getSecureUserId();

  if (!userId) {
    return { success: false, message: "Unauthorized", isBookmarked: false };
  }
  try {
    const { success: allowed } = await interactionLimiter.limit(
      `bookmark_${userId}`,
    );
    if (!allowed) {
      return {
        success: false,
        message: "Too many actions. Please slow down.",
        isBookmarked: action === "unbookmark",
      };
    }
    if (action === "unbookmark") {
      await db.bookmark.deleteMany({
        where: { postId, userId },
      });
    } else {
      await db.bookmark.upsert({
        where: { postId_userId: { postId, userId } },
        create: { postId, userId },
        update: {}, // Do nothing if it already exists
      });
    }
    revalidateTag(`bookmarks-${userId}`, "max");
    return { success: true, isBookmarked: action === "bookmark" };
  } catch {
    return {
      success: false,
      message: "Database error",
      // Safely tell the UI to revert to the previous state on failure
      isBookmarked: action === "unbookmark",
    };
  }
}
