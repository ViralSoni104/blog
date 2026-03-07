import type { Metadata } from "next";
import SendVerificationMail from "@/components/auth/forms/send-verification-mail-form";
import { homeRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Send Verification Mail",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  homeRedirect();
  return <SendVerificationMail />;
}
