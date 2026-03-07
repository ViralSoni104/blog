"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { newPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/utils";
import { updatePasswordLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const newPasswordAction = async (
  values: z.infer<typeof newPasswordSchema>,
  token?: string | null,
) => {
  const rateLimitRes = await checkRateLimit(
    updatePasswordLimiter,
    headers,
    token,
  );
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };
  if (!token) return { error: "Missing token!" };

  const validatedFields = newPasswordSchema.safeParse(values);
  if (!validatedFields.success) return { error: "Invalid fields!" };

  const { password } = validatedFields.data;

  // 1. Check if token exists
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) return { error: "Invalid token!" };

  // 2. Check if token has expired
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "Token has expired!" };

  // 3. Find the user
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) return { error: "Invalid token" };

  // 4. Hash new password and update
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  // 5. Delete the reset token
  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated!" };
};
