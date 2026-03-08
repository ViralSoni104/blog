"use client";

import * as z from "zod";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { loginFormSchema as formSchema } from "@/schemas/index";
import { loginAction } from "@/actions/login";
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
import {
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { resendTwoFactorCode } from "@/actions/resend-2fa";
import Loading from "@/components/ui/loading";
import { usePostHog } from "posthog-js/react";

type Schema = z.infer<typeof formSchema>;

function LoginFormContent() {
  const { update } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(urlError);
  const [success, setSuccess] = useState<string | null>("");
  const [countdown, setCountdown] = useState(0);
  const posthog = usePostHog();

  // Logic: Timer to manage cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", code: "", twoFactorStep: false },
  });
  const {
    formState: { isSubmitting },
    resetField,
  } = form;

  const codeValue = useWatch({
    control: form.control,
    name: "code",
  });

  const onResendCode = async () => {
    setError("");
    setSuccess("");
    const email = form.getValues("email");
    setCountdown(60); // 60-second cooldown

    const res = await resendTwoFactorCode(email);
    if (res.success) {
      setSuccess(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    // if (showTwoFactor && (!data.code || data.code.length < 6)) {
    //   setError("Please enter the 6-digit verification code.");
    //   return;
    // }
    setError("");
    setSuccess("");
    let res;
    try {
      res = await loginAction(data, callbackUrl);
    } catch (err) {
      update();
      posthog.capture("user_logged_in", {
        method: "email_password",
      });
      const isRedirect =
        err instanceof Error && err.message.includes("NEXT_REDIRECT");
      if (!isRedirect) {
        setError("An error occurred during login.");
        resetField("password");
      }
    }
    if (res?.twoFactor) {
      setShowTwoFactor(true);
      form.setValue("twoFactorStep", true);
    }
    if (res && res.success === false) {
      setError(res.message);
      if (!showTwoFactor) {
        resetField("password");
      } else {
        // If 2FA failed, just clear the code field instead
        resetField("code");
      }
      posthog.capture("auth_error", {
        type: "login",
        error_message: res.message,
        used_2fa: showTwoFactor,
      });
    }
    if (res && res.success) {
      setSuccess(res.message);
    }
  });

  return (
    <CardWrapper
      headerTitle={showTwoFactor ? "Two-Factor Auth" : "Welcome Back"}
      headerLabel={
        showTwoFactor
          ? "Check your email for a 6-digit code."
          : "Enter your credentials to access your account."
      }
      backButtonSubLabel="Don't have an account?"
      backButtonMainLabel=" Sign up"
      backButtonHref="/auth/signup"
      // showSocial
      pageName={showTwoFactor ? "Verification Code" : "Login"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup className="flex flex-col gap-4">
          {showTwoFactor && (
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-sm flex justify-center tracking-widest uppercase w-[100%] opacity-70">
                    Verification Code
                  </FieldLabel>
                  <InputOTP
                    {...field}
                    inputMode="numeric"
                    containerClassName="justify-center"
                    disabled={isSubmitting}
                    id="digits-only"
                    maxLength={6}
                    placeholder="123456"
                    className="rounded-xl text-center text-lg font-mono tracking-widest"
                    pattern={REGEXP_ONLY_DIGITS}
                  >
                    <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:text-xl">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <div className="flex flex-col items-center mt-2">
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={countdown > 0 || isSubmitting}
                      type="button"
                      onClick={onResendCode}
                    >
                      <IconRefresh />
                      {countdown > 0 ? `Wait for ${countdown}s` : "Resend Code"}
                    </Button>
                  </div>
                </Field>
              )}
            />
          )}
          {!showTwoFactor && (
            <>
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

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                        Password
                      </FieldLabel>
                      <Link
                        href="/auth/reset-password"
                        className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="h-12 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <IconEyeOff className="size-5" />
                        ) : (
                          <IconEye className="size-5" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </>
          )}

          <Button
            disabled={isSubmitting || (showTwoFactor && !codeValue)}
            className="w-full h-12 rounded-xl mt-2 font-bold text-lg shadow-md shadow-primary/10 text-background"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <IconLoader2 className="animate-spin size-5" />
                <span>Logging in...</span>
              </div>
            ) : showTwoFactor ? (
              "Confirm Code"
            ) : (
              "Log In"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FormMessage error={error} success={success} />

      {/* Logic: Contextual link for verification issues */}
      {error?.includes("verified") && (
        <div className="mt-4 flex justify-center">
          <Link
            href="/auth/send-verification-mail"
            className="text-sm font-medium underline text-primary underline-offset-2"
          >
            Not verified? Resend activation link
          </Link>
        </div>
      )}
    </CardWrapper>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginFormContent />
    </Suspense>
  );
}
