"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/schemas";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth"; // Your helper to get session
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();

  if (!user)
    return {
      success: false,
      message: "Unauthorized",
    };

  const dbUser = await getUserById(user.id);
  if (!dbUser) return { success: false, message: "Unauthorized" };

  // 1. Logic for OAuth Users (Restrict fields)
  if (user.isOAuth) {
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined; // Optional: Google usually handles its own 2FA
  }

  // 1. Separate database fields from validation fields
  const { password, newPassword, ...rest } = values;

  // 2. Prepare the update object
  const dataToUpdate: Prisma.UserUpdateInput = { ...rest };

  // 3. Password Change Logic
  if (password && newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(password, dbUser.password);
    if (!passwordsMatch) {
      return { success: false, message: "Invalid current password!" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    values.newPassword = undefined;
    dataToUpdate.password = hashedPassword;
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: { ...dataToUpdate },
  });

  return { success: true, message: "Settings updated!" };
};
