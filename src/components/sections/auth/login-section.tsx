"use client";

import { m } from "framer-motion";
import { LoginForm } from "@/components/auth/forms/login-form";
import { fadeUp } from "@/lib/motion";
import { Suspense } from "react";
import { IconLoader2 } from "@tabler/icons-react";

export default function LoginSection() {
  return (
    <div className="flex w-full items-center justify-center">
      <m.div {...fadeUp} className="flex flex-col px-4 lg:w-1/2 w-full">
        <div className="mt-6">
          <Suspense fallback={<LoginFallback />}>
            <LoginForm />
          </Suspense>
        </div>
      </m.div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-muted-foreground/20 bg-muted/5">
      <IconLoader2 className="animate-spin text-muted-foreground" size={24} />
      <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-widest">
        Initializing Auth...
      </p>
    </div>
  );
}
