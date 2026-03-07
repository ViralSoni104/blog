"use server";
import { verifyEmailExists } from "@/lib/email-verification";
import { sendContactFormMail } from "@/lib/mail";
import { contactLimiter } from "@/lib/rate-limit";
import { checkRateLimit } from "@/lib/utils";
import { ContactFormData, ContactFormSchema } from "@/schemas";
import { headers } from "next/headers";

export const sendContactMailAction = async (data: ContactFormData) => {
  const rateLimitRes = await checkRateLimit(contactLimiter, headers);
  if (rateLimitRes.success === false)
    return {
      success: rateLimitRes.success,
      message: rateLimitRes.message,
    };
  const validatedFields = ContactFormSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Invalid fields!",
      errors: validatedFields.error.message,
    };
  }
  const { name, email, message, fax } = validatedFields.data;
  if (fax && fax.length > 0) {
    // Return fake success to fool the bot
    return {
      success: true,
      message: "Message sent successfully! I will connect to you asap!",
    };
  }
  try {
    // Placeholder for your contact action
    // const res = await contactAction(values);
    const res = await verifyEmailExists(email);
    if (res.success === false)
      return {
        success: false,
        message: res.message,
      };
    await sendContactFormMail({ name, email, message });
    return {
      success: true,
      message: "Message sent successfully! I will contact you soon!",
    };
  } catch {
    return { success: false, message: "Failed to send message." };
  }
};
