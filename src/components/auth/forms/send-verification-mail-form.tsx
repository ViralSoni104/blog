"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendVerificationMail } from "@/actions/send-verification";
import { verificationEmailSchema } from "@/schemas";
import { FormMessage } from "../ui/auth-form-message";
import { CardWrapper } from "../ui/auth-card-wrapper";
import { IconLoader2 } from "@tabler/icons-react";

type Schema = z.infer<typeof verificationEmailSchema>;

export default function ResendPage() {
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");
  const [countdown, setCountdown] = useState(0);

  // Logic: Timer to manage cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm<Schema>({
    resolver: zodResolver(verificationEmailSchema),
    defaultValues: { email: "" },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: Schema) => {
    setError("");
    setSuccess("");
    let res;
    try {
      res = await sendVerificationMail(data.email);
    } catch {
      setError("An unexpected error occurred.");
    }
    if (res && !res.success) {
      setError(res.message);
    } else {
      setSuccess(res.message);
      setCountdown(120); // 2 minute cooldown
    }
  };

  return (
    <CardWrapper
      headerTitle="Verify Email"
      headerLabel="Enter your email address to receive a new verification link."
      backButtonSubLabel="Back to Login"
      showBackButtonArrow
      backButtonHref="/auth/login"
      showSocial={false} // Logic: No socials needed for resend link
      pageName="Verify Email"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                  Email Address
                </FieldLabel>
                <Input
                  {...field}
                  disabled={isSubmitting || countdown > 0}
                  type="email"
                  placeholder="john@example.com"
                  className="h-12 rounded-xl"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            disabled={isSubmitting || countdown > 0}
            className="w-full h-12 rounded-xl mt-2 font-bold text-lg shadow-md shadow-primary/10 text-background transition-all"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <IconLoader2 className="animate-spin size-5" />
                <span>Sending...</span>
              </div>
            ) : countdown > 0 ? (
              "Wait before resending"
            ) : (
              "Send Verification Link"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FormMessage error={error} success={success} />
    </CardWrapper>
  );
}
