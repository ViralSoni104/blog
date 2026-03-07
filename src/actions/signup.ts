"use server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signupData, signupFormSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendVerificationMail } from "@/actions/send-verification";
import { verifyEmailExists } from "@/lib/email-verification";
import { signupLimiter } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/utils";

export const signupAction = async (data: signupData) => {
  const rateLimitRes = await checkRateLimit(signupLimiter, headers);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };

  const validatedFields = signupFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid fields!",
      errors: validatedFields.error.message,
    };
  }
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      success: false,
      message: "This email is already in use!",
    };
  }
  const res = await verifyEmailExists(email);
  if (res.success === false)
    return {
      success: false,
      message: res.message,
    };
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
  //send verification email logic here
  // const verificationToken = await generateVerificationToken(email);
  // sendVerificationEmail(verificationToken.email, verificationToken.token);
  sendVerificationMail(email);
  return {
    success: true,
    message: "Verification Email sent.",
  };
};
