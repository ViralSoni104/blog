"use server";
import { loginData, loginFormSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { db } from "@/lib/db";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { checkRateLimit } from "@/lib/utils";
import { loginLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { resendTwoFactorCode } from "./resend-2fa";

export const loginAction = async (
  data: loginData,
  callbackUrl: string | null,
) => {
  const rateLimitRes = await checkRateLimit(loginLimiter, headers);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };
  const validatedFields = loginFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid Fields!",
      errors: validatedFields.error.message,
    };
  }
  const { email, password, code } = validatedFields.data;
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return {
      success: false,
      message: "Invalid credentials or account not verified!",
    };
  }
  const passwordsMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordsMatch || !existingUser.emailVerified) {
    return {
      success: false,
      message: "Invalid credentials or account not verified!",
    };
  }
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (validatedFields.data.twoFactorStep) {
      if (!code)
        return { success: false, message: "Invalid Verification code!" };
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { success: false, message: "Invalid Verification code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { success: false, message: "Verification code has expired!" };
      }

      // Step B: Cleanup token and handle confirmation
      await db.twoFactorToken.delete({ where: { id: twoFactorToken.id } });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id,
      );
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      const res = await resendTwoFactorCode(existingUser.email);
      return { twoFactor: true, success: res.success };
    }
  }
  if (existingUser.role === "ADMIN") callbackUrl = "/admin";
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "Invalid credentials or account not verified!",
          };
        default:
          return {
            success: false,
            message: "An error occurred during login. Please try again.",
          };
      }
    }
    throw error;
  }
};
