"use client";

import * as z from "zod";
import { signupFormSchema as formSchema } from "@/schemas/index";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupAction } from "@/actions/signup";
import { useState } from "react";
import { CardWrapper } from "../ui/auth-card-wrapper";
import { FormMessage } from "../ui/auth-form-message";
import { usePostHog } from "posthog-js/react";

type Schema = z.infer<typeof formSchema>;

export function SignupForm() {
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");
  const [showPassword, setShowPassword] = useState(false);
  const posthog = usePostHog();
  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      "confirm-password": "",
    },
  });

  const {
    formState: { isSubmitting },
    reset,
    resetField,
  } = form;

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    setError("");
    setSuccess("");
    let res;
    try {
      res = await signupAction(data);
    } catch {
      setError("An unexpected error occurred.");
    }
    if (res && !res.success) {
      setError(res.message);
      resetField("password");
      resetField("confirm-password");
      posthog.capture("auth_error", {
        type: "signup",
        error_message: res.message,
      });
    } else if (res && res.success) {
      reset();
      setSuccess(res.message);
      posthog.capture("user_signed_up", {
        method: "email", // To differentiate from Google/Github if you add OAuth later
      });
    }
  });

  return (
    <CardWrapper
      headerTitle="Create Account"
      headerLabel="Join VRS Blog and start sharing your thoughts."
      backButtonSubLabel="Already have an account?"
      backButtonMainLabel=" Login"
      backButtonHref="/auth/login"
      showSocial
      pageName="Signup"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... Input Fields ... */}
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                  Full Name
                </FieldLabel>
                <Input
                  {...field}
                  disabled={isSubmitting}
                  placeholder="John Doe"
                  className="h-12 rounded-xl"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

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
                  disabled={isSubmitting}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 rounded-xl"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirm-password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                    Confirm
                  </FieldLabel>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 rounded-xl"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="flex items-end justify-start space-x-1 px-1">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="size-3 rounded border-muted-foreground/30 accent-primary cursor-pointer"
            />
            <label
              htmlFor="showPassword"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
            >
              Show Passwords
            </label>
          </div>
          <Button
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl mt-1 font-bold text-lg"
          >
            {isSubmitting ? "Creating..." : "Get Started"}
          </Button>
        </FieldGroup>
      </form>
      <FormMessage error={error} success={success} />
    </CardWrapper>
  );
}
