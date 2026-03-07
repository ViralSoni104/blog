"use server";

import { db } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteUser(id: string) {
  try {
    await db.user.delete({ where: { id } });
    revalidateTag("admin-users", "max");
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted from system." };
  } catch {
    return { success: false, message: "Failed to delete user." };
  }
}

export async function bulkDeleteUsers(ids: string[]) {
  try {
    await db.user.deleteMany({ where: { id: { in: ids } } });
    revalidateTag("admin-users", "max");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function bulkToggleUserVerification(
  ids: string[],
  verify: boolean,
) {
  try {
    await db.user.updateMany({
      where: { id: { in: ids } },
      data: { emailVerified: verify ? new Date() : null },
    });
    revalidateTag("admin-users", "max");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function cleanupPendingUsers() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const result = await db.user.deleteMany({
      where: {
        emailVerified: null,
        createdAt: { lt: sixMonthsAgo },
      },
    });
    revalidateTag("admin-users", "max");
    return { success: true, count: result.count };
  } catch {
    return { success: false };
  }
}
