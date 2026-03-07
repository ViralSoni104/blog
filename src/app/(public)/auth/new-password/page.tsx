import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/forms/new-password-form";
import { homeRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Set new password",
  robots: { index: false, follow: false },
};

export default async function NewPasswordPage() {
  homeRedirect();
  return <NewPasswordForm />;
}
