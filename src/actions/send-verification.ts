// actions/resend-verification.ts
"use server";

import { getVerificationTokenByEmail } from "@/data/verification-token";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { getUserByEmail } from "@/data/user";

export const sendVerificationMail = async (email: string) => {
  const existingUser = await getUserByEmail(email);
  if (!existingUser || existingUser.emailVerified) {
    return {
      success: true,
      message: "Verification email sent.",
    };
  }

  const existingToken = await getVerificationTokenByEmail(email);

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

  const verificationToken = await generateVerificationToken(email);
  sendVerificationEmail(verificationToken.email, verificationToken.token);
  return { success: true, message: "Verification email sent!" };
};
