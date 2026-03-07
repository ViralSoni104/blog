"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function getActiveEmailsAction() {
  const subscribers = await db.subscriber.findMany({
    where: { isActive: true },
    select: { email: true },
  });
  return subscribers.map((s) => s.email);
}

export async function deleteSubscriber(id: string) {
  try {
    await db.subscriber.delete({ where: { id } });
    revalidatePath("/admin/subscribers");
    return { success: true, message: "Subscriber removed." };
  } catch {
    return { success: false, message: "Failed to delete." };
  }
}

export async function bulkToggleSubscriberStatus(
  ids: string[],
  active: boolean,
) {
  try {
    await db.subscriber.updateMany({
      where: { id: { in: ids } },
      data: { isActive: active },
    });
    // Next.js 16: stale-while-revalidate for admin list
    revalidateTag("subscribers", "max");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function cleanupInactiveSubscribers() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const result = await db.subscriber.updateMany({
      where: {
        isActive: true,
        createdAt: { lt: sixMonthsAgo },
      },
      data: { isActive: false },
    });
    revalidateTag("subscribers-list", "max");
    return { success: true, count: result.count };
  } catch {
    return { success: false };
  }
}

export async function bulkDeleteSubscribers(ids: string[]) {
  try {
    if (!ids.length) return { success: false, error: "No IDs provided" };

    await db.subscriber.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // Refresh the admin and public subscriber caches
    revalidateTag("subscribers", "max");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete subscribers" };
  }
}
