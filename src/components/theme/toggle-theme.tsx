"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  themeIconEnter,
  themeIconTransition,
  reducedThemeIcon,
} from "@/lib/motion";

export default function ToggleTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // ✅ Prevent hydration mismatch without triggering strict linter warnings
  useEffect(() => {
    // Wrapping in a microtask queue defers the state update just enough
    // to avoid the synchronous cascading render warning, while still
    // safely hydrating the client state.
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark");
      return;
    }

    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark");
    });
  };

  const motionProps = shouldReduceMotion
    ? reducedThemeIcon
    : themeIconEnter[isDark ? "dark" : "light"];

  // Return a static placeholder during SSR to guarantee hydration match
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        disabled
        className="relative h-9 w-9 rounded-lg p-0 opacity-0"
        aria-label="Toggle theme placeholder"
      />
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-lg p-0 hover:bg-secondary/40 active:scale-90"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <m.span
            key="sun"
            className="absolute"
            {...motionProps}
            transition={themeIconTransition}
          >
            <IconSun className="size-5 text-foreground" stroke={1.75} />
          </m.span>
        ) : (
          <m.span
            key="moon"
            className="absolute"
            {...motionProps}
            transition={themeIconTransition}
          >
            <IconMoon className="size-5 text-foreground" stroke={1.75} />
          </m.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
