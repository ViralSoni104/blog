"use server";

import * as z from "zod";
import { resetSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { checkRateLimit } from "@/lib/utils";
import { resetPasswordLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const resetAction = async (values: z.infer<typeof resetSchema>) => {
  const rateLimitRes = await checkRateLimit(resetPasswordLimiter, headers);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };
  const validatedFields = resetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, message: "Invalid email!" };
  }

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { success: true, message: "Password reset email sent!" };
  }
  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    const now = new Date();
    // Logic: Since token expires in 60 mins, we check if it was created < 2 mins ago
    // 60 minutes - 2 minutes = 58 minutes.
    const retryAllowedTime = new Date(
      existingToken.expires.getTime() - 58 * 60 * 1000,
    );
    if (now < retryAllowedTime) {
      return {
        success: false,
        message: "Please wait before requesting another email.",
      };
    }
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

  return { success: true, message: "Password reset email sent!" };
};
