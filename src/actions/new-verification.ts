"use server";

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { checkRateLimit } from "@/lib/utils";
import { verificationLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const newVerificationAction = async (token: string) => {
  const rateLimitRes = await checkRateLimit(
    verificationLimiter,
    headers,
    token,
  );
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };
  // 1. Logic: Check if token exists
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { success: false, message: "Token does not exist!" };
  }

  // 2. Logic: Check if token has expired
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { success: false, message: "Token has expired!" };
  }

  // 3. Logic: Find the user
  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { success: false, message: "Email does not exist!" };
  }

  // 4. Logic: Update user and delete token
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      // Logic: Also update email in case user changed it
      email: existingToken.email,
    },
  });

  await db.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: true, message: "Email verified!" };
};
