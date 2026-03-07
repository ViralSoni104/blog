"use client";

import { m } from "framer-motion";
import { SignupForm } from "@/components/auth/forms/signup-form";
import { fadeUp } from "@/lib/motion";

export default function SignUpSection() {
  return (
    <div className="flex w-full items-center justify-center">
      <m.div {...fadeUp} className="flex flex-col px-4 lg:w-1/2 w-full">
        <div className="mt-6">
          <SignupForm />
        </div>
      </m.div>
    </div>
  );
}
