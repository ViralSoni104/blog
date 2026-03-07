import type { Metadata } from "next";
import SettingsForm from "@/components/auth/forms/settings-form";
import { authRedirect } from "@/lib/auth";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";

export const metadata: Metadata = {
  title: "Settings",
  description: "Set your account.",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    // 1. The outer page renders instantly
    <div className="w-full max-w-2xl mx-auto">
      <Suspense fallback={<Loading />}>
        {/* 2. The dynamic auth check happens inside Suspense */}
        <SettingsContent />
      </Suspense>
    </div>
  );
}

// 💡 Move the async auth logic down here
async function SettingsContent() {
  const session = await authRedirect();
  return <SettingsForm user={session.user} />;
}
