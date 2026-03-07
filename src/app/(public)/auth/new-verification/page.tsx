import { NewVerificationForm } from "@/components/auth/forms/new-verification-form";
import { Suspense } from "react";
import { newVerificationAction } from "@/actions/new-verification";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Account",
  robots: { index: false, follow: false },
};

interface NewVerificationPageProps {
  searchParams: Promise<{ token?: string }>;
}

// 💡 1. Extract the blocking async logic into its own internal component
async function VerificationContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <NewVerificationForm error="Missing token!" />;
  }

  const res = await newVerificationAction(token);

  return (
    <NewVerificationForm
      success={res.success ? res.message : undefined}
      error={!res.success ? res.message : undefined}
    />
  );
}

// 💡 2. The main Page component is now synchronous. It instantly streams the
// Suspense fallback to the user while `VerificationContent` does the heavy lifting.
export default function NewVerificationPage({
  searchParams,
}: NewVerificationPageProps) {
  return (
    <Suspense fallback={<NewVerificationForm loading />}>
      {/* Pass the raw promise down to the child component */}
      <VerificationContent searchParams={searchParams} />
    </Suspense>
  );
}
