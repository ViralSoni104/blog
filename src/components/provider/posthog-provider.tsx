"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";

// 1. Initialize PostHog (Only runs once on the client)
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
  });
}

// 2. Component to track pageviews and logged-in users
function PostHogTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession(); // Grab the Auth.js session

  // Track Page Views
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  // Track Logged-in Users (Product Analytics)
  useEffect(() => {
    if (session?.user?.id) {
      // Connects their actions to their database ID
      posthog.identify(session.user.id, {
        email: session.user.email,
        name: session.user.name,
      });
    } else if (session === null) {
      // If they log out, reset them back to anonymous
      posthog.reset();
    }
  }, [session]);

  return null;
}

// 3. The actual Provider wrapper
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
