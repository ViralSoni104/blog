"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {/* 💡 This satisfies the WCAG 2.3.3 requirement for the scanner */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
