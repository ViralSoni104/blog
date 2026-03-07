"use server";

import { getUserByEmail } from "@/data/user";
import { generateTwoFactorToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/utils";
import { twoFALimiter } from "@/lib/rate-limit"; // Reuse or create a specific resendLimiter
import { headers } from "next/headers";

export const resendTwoFactorCode = async (email: string | undefined) => {
  if (!email) return { success: false, message: "Email is required." };

  // 1. Rate Limit
  const rateLimit = await checkRateLimit(twoFALimiter, headers, email);
  if (rateLimit.success === false)
    return {
      success: rateLimit.success,
      message: rateLimit.message,
    };

  // 2. Verify User
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.isTwoFactorEnabled) {
    return {
      success: false,
      message: "Invalid credentials or account not verified!",
    };
  }

  // 3. Generate and Send
  const twoFactorToken = await generateTwoFactorToken(existingUser.email!);
  sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

  return { success: true, message: "A new verification code has been sent." };
};
