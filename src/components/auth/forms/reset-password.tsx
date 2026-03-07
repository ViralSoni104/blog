"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetSchema as formSchema } from "@/schemas";
import { resetAction } from "@/actions/reset-password";

import { CardWrapper } from "@/components/auth/ui/auth-card-wrapper";
import { FormMessage } from "@/components/auth/ui/auth-form-message";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { IconLoader2 } from "@tabler/icons-react";

type Schema = z.infer<typeof formSchema>;

export default function ResetPassword() {
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
      res = await resetAction(data);
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
      headerTitle="Forgot your password?"
      headerLabel="Enter your email to receive a reset link."
      backButtonSubLabel="Back to Login"
      backButtonHref="/auth/login"
      showBackButtonArrow
      pageName="Reset Password"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
              Email Address
            </FieldLabel>
            <Input
              {...form.register("email")}
              disabled={form.formState.isSubmitting}
              placeholder="john.doe@example.com"
              type="email"
              className="h-12 rounded-xl"
            />
            {form.formState.errors.email && (
              <FieldError errors={[form.formState.errors.email]} />
            )}
          </Field>
        </FieldGroup>

        <FormMessage error={error} success={success} />

        <Button
          disabled={isSubmitting || countdown > 0}
          type="submit"
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
            "Send reset Link"
          )}
        </Button>
      </form>
    </CardWrapper>
  );
}
