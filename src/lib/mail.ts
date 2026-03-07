// lib/mail.ts
import "server-only";
import { ContactFormData } from "@/schemas";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // The 16-digit code
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXTAUTH_URL}/auth/new-verification?token=${token}`;
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Confirm your email",
      html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>Comfirm your email</h2>
      <p>We are very excited to have you onboard.</p><p>To get started using VRS Blog, please confirm your account below.</p><p>
      <a href="${confirmLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
      Confirm email
      </a>
      <p>If you're having trouble clicking the confirm account button, copy and paste
      the below URL into your web browser.</p><a href="<%= confirmation_url %>">${confirmLink}</a>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
      </div>`,
    });
  } catch {
    return {
      success: false,
      message: "Opps! Something went wrong, Please try again later.",
    };
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  // Logic: Construct the reset link pointing to your new-password page
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/new-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER, // Replace with your verified domain
      to: email,
      subject: "Reset your password",
      html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>Reset your password</h2>
        <p>Click the button below to reset your password for your VRS Blog account.</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you're having trouble clicking the confirm account button, copy and paste
        the below URL into your web browser.</p><p>${resetLink}</p>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    });
  } catch {
    return {
      success: false,
      message: "Opps! Something went wrong, Please try again later.",
    };
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER, // Replace with your verified domain
      to: email,
      subject: "2FA Verification Code",
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #000; margin: 0; font-size: 24px;">Security Verification</h2>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
        <p style="font-size: 16px; line-height: 1.5;">Use the following verification code to complete your sign-in process. This code is valid for <strong>5 minutes</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; padding: 15px 30px; background-color: #f4f4f5; border-radius: 8px; border: 1px solid #d4d4d8;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #000;">${token}</span>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #666; line-height: 1.5;">
          <strong>Security Note:</strong> If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    });
  } catch {
    return {
      success: false,
      message: "Opps! Something went wrong, Please try again later.",
    };
  }
};

export const sendContactFormMail = async (data: ContactFormData) => {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER, // Replace with your verified domain
      to: process.env.GMAIL_USER,
      subject: `New Contact Form Submission By - ${data.name}`,
      html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <br/>
          <p><strong>Message:</strong></p>
          <p>${data.message.replace(/\n/g, "<br>")}</p>
        `,
    });
  } catch {
    return {
      success: false,
      message: "Opps! Something went wrong, Please try again later.",
    };
  }
};

export const sendWelcomeEmail = async (email: string, token: string) => {
  const unsubscribeLink = `${process.env.NEXTAUTH_URL}/unsubscribe?token=${token}`;
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER, // Replace with your verified domain
      to: email,
      subject: `Welcome to VRS Blog Newsletter`,
      html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <h1 style="color: #000; text-align: center;">Welcome to VRS Blog - Logic & Soul</h1>
        <p>Hi there,</p>
        <p>Thanks for joining our community. You're now on the list to receive our latest updates, deep dives, and soul-centered insights.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
          <p style="margin: 0; font-weight: bold;">What to expect:</p>
          <ul style="list-style: none; padding: 0;">
            <li>✨ Weekly curated insights</li>
            <li>🚀 Early access to new features</li>
            <li>🧠 Thought-provoking articles</li>
          </ul>
        </div>

        <p>We’re glad to have you with us.</p>
        <p>Best,<br/>The VRS Blog Team</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;" />
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          You received this because you subscribed to Logic & Soul.<br/>
          <a href="${unsubscribeLink}" style="color: #999; text-decoration: underline;">
            One-click Unsubscribe
          </a>
        </p>
      </div>
        `,
    });
  } catch {
    return {
      success: false,
      message: "Opps! Something went wrong, Please try again later.",
    };
  }
};
