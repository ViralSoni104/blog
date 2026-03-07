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

export default async function UnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <Unsubscribe error="Missing token!" />;
  }
  const res = await unsubscribeAction(token);
  return (
    <Suspense fallback={<Unsubscribe loading />}>
      <Unsubscribe
        success={res.success ? res.message : undefined}
        error={!res.success ? res.message : undefined}
      />
    </Suspense>
  );
}
