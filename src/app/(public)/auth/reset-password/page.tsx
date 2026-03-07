import type { Metadata } from "next";
import ResetPassword from "@/components/auth/forms/reset-password";
import { homeRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Send Reset Link",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  homeRedirect();
  return <ResetPassword />;
}
