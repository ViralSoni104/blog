import type { Metadata } from "next";
import LoginSection from "@/components/sections/auth/login-section";
import { homeRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to your Logic & Soul account.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  homeRedirect();
  return <LoginSection />;
}
