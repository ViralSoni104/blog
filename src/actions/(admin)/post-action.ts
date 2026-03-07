"use server";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { postSchema, PostInput } from "@/schemas";
import { deleteImagesByUrls, extractImageUrls } from "@/lib/imagekit";

function calculateReadingTimeServer(html: string): number {
  if (!html) return 1;

  const text = html.replace(/<[^>]*>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const imageCount = (html.match(/<img/g) || []).length;
  const codeBlockCount = (html.match(/<pre/g) || []).length;
  const tableCount = (html.match(/<table/g) || []).length;
  const quoteCount = (html.match(/<blockquote/g) || []).length;

  const wordsPerMinute = 200;
  const textMinutes = wordCount / wordsPerMinute;

  const imageSeconds = imageCount * 12;
  const codeSeconds = codeBlockCount * 20;
  const tableSeconds = tableCount * 15;
  const quoteSeconds = quoteCount * 8;

  const totalSeconds =
    textMinutes * 60 + imageSeconds + codeSeconds + tableSeconds + quoteSeconds;

  return Math.max(1, Math.ceil(totalSeconds / 60));
}

// const ADMIN_PATH = "/admin/posts";
async function purgePostImages(
  ids: string[],
  currentData?: { image: string | null; content: string },
) {
  const posts = currentData
    ? [currentData]
    : await db.post.findMany({
        where: { id: { in: ids } },
        select: { image: true, content: true },
      });

  const urls: string[] = [];
  posts.forEach((p) => {
    if (p.image) urls.push(p.image);
    urls.push(...extractImageUrls(p.content));
  });

  if (urls.length > 0) await deleteImagesByUrls(urls);
}

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function bulkDeletePosts(ids: string[]) {
  try {
    // 💡 If you have images, you'd fetch the public_ids here and delete from Imagekit first
    await ensureAdmin();
    // 💡 Single Batch API Call for all images across all selected posts
    await purgePostImages(ids);
    await db.post.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    revalidateTag("posts", "max");
    revalidateTag("categories", "max");
    return { success: true, message: "Posts deleted successfully" };
  } catch {
    return { success: false, error: "Failed to delete selected posts." };
  }
}

export async function createPost(values: PostInput) {
  const parsed = postSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Invalid fields" };
  }

  try {
    const adminId = await ensureAdmin();
    const { categoryIds, ...rest } = parsed.data;
    const readingTime = calculateReadingTimeServer(parsed.data.content);
    await db.post.create({
      data: {
        ...rest,
        authorId: adminId,
        readingTime: readingTime,
        categories: {
          connect: categoryIds.map((id) => ({ id })),
        },
      },
    });
    revalidateTag("posts", "max");
    revalidateTag("categories", "max");
    return { success: true, message: "Post created successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error && error.message.includes("Unique constraint")
          ? "Slug already exists"
          : "Something went wrong",
    };
  }
}

export async function updatePost(id: string, values: PostInput) {
  const parsed = postSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Invalid fields" };
  }

  try {
    await ensureAdmin();
    const current = await db.post.findUnique({
      where: { id },
      select: { image: true, content: true },
    });

    if (!current) return { success: false, message: "Post not found!" };

    const oldUrls = [
      current.image,
      ...extractImageUrls(current.content),
    ].filter(Boolean) as string[];
    const newUrls = [values.image, ...extractImageUrls(values.content)].filter(
      Boolean,
    ) as string[];

    const toDelete = oldUrls.filter((url) => !newUrls.includes(url));
    if (toDelete.length > 0) await deleteImagesByUrls(toDelete);

    const { categoryIds, ...rest } = parsed.data;
    const readingTime = calculateReadingTimeServer(parsed.data.content);
    await db.post.update({
      where: { id },
      data: {
        ...rest,
        readingTime: readingTime,
        categories: {
          set: categoryIds.map((id) => ({ id })),
        },
      },
    });
    revalidateTag("posts", "max");
    revalidateTag("categories", "max");
    return { success: true, message: "Post updated successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error && error.message.includes("Unique constraint")
          ? "Slug already exists"
          : "Update failed",
    };
  }
}

export async function deletePost(id: string) {
  const res = await bulkDeletePosts([id]);
  return res;
}

export async function bulkTogglePostStatus(ids: string[], publish: boolean) {
  try {
    await ensureAdmin();
    await db.post.updateMany({
      where: { id: { in: ids } },
      data: { published: publish },
    });
    revalidateTag("posts", "max"); // Refresh public feed
    return { success: true };
  } catch {
    return { success: false };
  }
}
