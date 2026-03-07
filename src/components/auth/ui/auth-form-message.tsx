"use client";

import { m, AnimatePresence } from "motion/react";
import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface FormMessageProps {
  error?: string | null;
  success?: string | null;
  top?: number;
}

export const FormMessage = ({ error, success, top }: FormMessageProps) => {
  if (!error && !success) return null;
  return (
    <AnimatePresence mode="wait">
      <m.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "p-4 rounded-xl border flex items-center gap-3 shadow-sm text-sm font-medium",
          top !== 0 && "mt-4",
          error
            ? "bg-destructive/5 border-destructive/20 text-destructive"
            : "bg-primary/5 border-primary/20 text-primary",
        )}
      >
        {error ? (
          <IconAlertTriangleFilled className="size-5 shrink-0" />
        ) : (
          <IconCircleCheckFilled className="size-5 shrink-0" />
        )}
        <p className="leading-snug">{error || success}</p>
      </m.div>
    </AnimatePresence>
  );
};
