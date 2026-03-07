"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { newPasswordSchema as formSchema } from "@/schemas/index";
import { newPasswordAction } from "@/actions/new-password";
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
import { IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react";
import Loading from "@/components/ui/loading";

type Schema = z.infer<typeof formSchema>;

function NewPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<Schema>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = (values: Schema) => {
    setError("");
    setSuccess("");
    let res;
    startTransition(async () => {
      try {
        res = await newPasswordAction(values, token);
      } catch {
        setError("Something went wrong. Please try again.");
      }
      if (res?.error) {
        setError(res.error);
      }
      if (res?.success) {
        setSuccess(res.success);
      }
    });
  };

  return (
    <CardWrapper
      headerTitle="Set New Password"
      headerLabel="Enter a strong password to secure your account."
      backButtonSubLabel="Remembered your password?"
      backButtonMainLabel=" Log in"
      backButtonHref="/auth/login"
      pageName="Set New Password"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs uppercase tracking-widest opacity-70">
                  New Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    disabled={isPending}
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

          <Button
            disabled={isPending}
            className="w-full h-12 rounded-xl mt-4 font-bold text-lg shadow-md shadow-primary/10 text-background"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <IconLoader2 className="animate-spin size-5" />
                <span>Updating...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </Button>
        </FieldGroup>
      </form>

      <FormMessage error={error} success={success} />
    </CardWrapper>
  );
}

export function NewPasswordForm() {
  return (
    <Suspense fallback={<Loading />}>
      <NewPasswordFormContent />
    </Suspense>
  );
}
