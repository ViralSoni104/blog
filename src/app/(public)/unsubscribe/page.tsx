import { Suspense } from "react";
import { Metadata } from "next";
import { Unsubscribe } from "@/components/unsubscribe";
import { unsubscribeAction } from "@/actions/newsletter";

export const metadata: Metadata = {
  title: "Unsubscribe Newsletter",
  description: "Unsubscribe to the VRS blog newsletter.",
  robots: {
    index: false,
    follow: false,
  },
};

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string }>;
}

// 💡 1. The Async Handler: Awaits the params AND the DB action safely inside Suspense
async function UnsubscribeHandler({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ token?: string }>;
}) {
  const { token } = await searchParamsPromise;

  if (!token) {
    return <Unsubscribe error="Missing token!" />;
  }

  const res = await unsubscribeAction(token);

  return (
    <Unsubscribe
      success={res.success ? res.message : undefined}
      error={!res.success ? res.message : undefined}
    />
  );
}

// 💡 2. The Page Shell: Removed 'async'! Renders the Suspense fallback instantly.
export default function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  return (
    <Suspense fallback={<Unsubscribe loading />}>
      {/* Pass the un-awaited Promise directly to the handler */}
      <UnsubscribeHandler searchParamsPromise={searchParams} />
    </Suspense>
  );
}
