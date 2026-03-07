import "server-only";

export const verifyEmailExists = async (email: string) => {
  const apiKey = process.env.EMAIL_VERIFICATION_API_KEY;
  const baseURL = process.env.EMAIL_VERIFICATION_URL;
  if (!apiKey) {
    return { success: true }; // Fallback so you don't block users if API is down
  }

  try {
    const response = await fetch(`${baseURL}${apiKey}&email=${email}`);
    const data = await response.json();
    const isSuspicious = data.email_quality.is_username_suspicious;
    const hasNoIdentity =
      !data.email_sender.organization_name &&
      !data.email_sender.email_provider_name;
    const isNotFree = !data.email_quality.is_free_email;

    // logic: If it's not a known free provider (Gmail/Outlook) AND has no Org name
    // AND has a weird username, it's almost certainly a disposable domain.
    const looksLikeBot = isSuspicious && isNotFree && hasNoIdentity;
    if (
      data.email_quality.is_disposable === true ||
      looksLikeBot ||
      data.email_quality.score < 0.7
    )
      return {
        success: false,
        message: "Please use a valid email address.",
      };
    if (data.email_deliverability.status === "deliverable")
      return { success: true };
    return {
      success: false,
      message:
        "We’re having trouble verifying this email. Please check for typos or use a different address",
    };
  } catch {
    return { success: true }; // Default to true if API fails to avoid blocking real users
  }
};

/*
lib/Gmail-Bot.ts -------------------->

import { connect } from "imap-simple";
import { simpleParser } from "mailparser";
import { db } from "@/lib/db";

const config = {
  imap: {
    user: process.env.GMAIL_USER, // e.g., your-email@gmail.com
    password: process.env.GMAIL_APP_PASSWORD, // 16-character app password
    host: "imap.gmail.com",
    port: 993,
    tls: true,
    authTimeout: 3000,
  },
};

export const processGmailBounces = async () => {
  try {
    const connection = await connect(config);
    await connection.openBox("INBOX");

    // 1. Search for unread emails from the Google Mailer Daemon
    const searchCriteria = ["UNSEEN", ["FROM", "mailer-daemon@googlemail.com"]];
    const fetchOptions = { bodies: ["HEADER", "TEXT"], markSeen: true };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const processedEmails: string[] = [];

    for (const message of messages) {
      const all = message.parts.find((part) => part.which === "TEXT");
      if (!all) continue;

      // 2. Parse the email body
      const parsed = await simpleParser(all.body);
      const content = parsed.text || "";

      // 3. Regex to find the failed recipient
      // Google bounces usually look like: "The response was: 550 5.1.1 The email account that you tried to reach does not exist..."
      // Or they explicitly list the address in the diagnostic code.
      const emailRegex = /To:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
      const match = content.match(emailRegex);

      if (match && match[1]) {
        const bouncedEmail = match[1].trim();

        // 4. Run db.user.delete()
        try {
          const deletedUser = await db.user.delete({
            where: { email: bouncedEmail },
          });
          if (deletedUser) processedEmails.push(bouncedEmail);
        } catch (error) {
          // User might already be deleted or not in DB
          console.error(`User ${bouncedEmail} not found in DB, skipping.`);
        }
      }
    }

    connection.end();
    return { success: true, count: processedEmails.length, emails: processedEmails };
  } catch (error) {
    console.error("IMAP Error:", error);
    throw new Error("Failed to process Gmail bounces");
  }
};

*/
