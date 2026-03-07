"use client";

import { useEffect, useRef } from "react";
import { incrementViewCount } from "@/actions/engagement-actions"; // adjust path if needed

export function ViewTracker({ postId }: { postId: string }) {
  const hasFetched = useRef(false);

  useEffect(() => {
    // React Strict Mode fires useEffect twice in dev. This ref prevents double-firing.
    if (!hasFetched.current) {
      hasFetched.current = true;
      incrementViewCount(postId).catch();
    }
  }, [postId]);

  return null; // This component renders absolutely nothing to the screen
}
