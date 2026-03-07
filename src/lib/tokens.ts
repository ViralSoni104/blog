import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getSubscriberByEmail } from "@/data/subscriber";

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db.verificationToken.delete({ where: { id: existingToken.id } });
  }
  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
  return verificationToken;
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id },
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 999_999).toString();
  // 2. Later Set expiration for 5 minutes from now (security best practice)
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  // 3. Check for an existing token for this email and delete it
  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // 4. Create the new token in the database
  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return twoFactorToken;
};

export const generateSubscriberToken = async (email: string) => {
  const token = uuidv4();

  // Check if they are already in the system
  const existingSubscriber = await getSubscriberByEmail(email);

  if (existingSubscriber && existingSubscriber.isActive)
    return { status: "ALREADY_ACTIVE", data: existingSubscriber };
  if (existingSubscriber && !existingSubscriber.isActive) {
    // If they exist but are re-subscribing, we might want to refresh the token
    const updated = await db.subscriber.update({
      where: { id: existingSubscriber.id },
      data: {
        token,
        isActive: true,
      },
    });
    return {
      status: "RE_SUBSCRIBED",
      data: updated,
    };
  }

  // If new, create them (Prisma will use the uuid() default if we don't pass one,
  // but passing it manually here gives us immediate access to the value)
  const subscriberToken = await db.subscriber.create({
    data: {
      email,
      token,
    },
  });
  return {
    status: "NEW_SUBSCRIBER",
    data: subscriberToken,
  };
};
