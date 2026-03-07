import type { Metadata } from "next";
import SignupSection from "@/components/sections/auth/signup-section";
import { homeRedirect } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  homeRedirect();
  return <SignupSection />;
}
