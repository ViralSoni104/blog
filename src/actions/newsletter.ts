"use server";
import { db } from "@/lib/db";
import { verifyEmailExists } from "@/lib/email-verification";
import { sendWelcomeEmail } from "@/lib/mail";
import { subscribeLimiter } from "@/lib/rate-limit";
import { generateSubscriberToken } from "@/lib/tokens";
import { checkRateLimit } from "@/lib/utils";
import { NewsletterSubscribeData, NewsletterSubscribeSchema } from "@/schemas";
import { headers } from "next/headers";

export const subscribeAction = async (values: NewsletterSubscribeData) => {
  const rateLimitRes = await checkRateLimit(subscribeLimiter, headers);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };
  const validatedFields = NewsletterSubscribeSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid fields!",
      errors: validatedFields.error.message,
    };
  }
  const { email, fax } = validatedFields.data;
  if (fax && fax.length > 0) {
    // Return fake success to fool the bot
    return {
      success: true,
      message: "Message sent successfully! I will connect to you asap!",
    };
  }
  try {
    const res = await verifyEmailExists(email);
    if (res.success === false)
      return {
        success: false,
        message: res.message,
      };
    if (res.success) {
      const result = await generateSubscriberToken(email);
      if (result.status === "ALREADY_ACTIVE") {
        return { success: true, message: "You're already on the list!" };
      }
      sendWelcomeEmail(result.data.email, result.data.token);
      return { success: true, message: "Thank you for subscribing!" };
    }
  } catch {
    return { success: false, message: "Something went wrong!" };
  }
};

export const unsubscribeAction = async (token: string) => {
  if (!token) {
    return { success: false, message: "Missing token." };
  }

  try {
    // 1. Find the subscriber by the unique token
    const existingSubscriber = await db.subscriber.findUnique({
      where: { token },
    });

    if (!existingSubscriber) {
      return { success: false, message: "Invalid or expired link." };
    }

    // 2. If already unsubscribed, just return success
    if (!existingSubscriber.isActive) {
      return { success: true, message: "You are already unsubscribed." };
    }

    // 3. Update the status
    await db.subscriber.update({
      where: { token },
      data: { isActive: false },
    });

    return {
      success: true,
      message: "You have been successfully unsubscribed from VRS Blog.",
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
};
