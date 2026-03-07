"use client";

import { m } from "framer-motion";
import { IconActivity, IconLoader2, IconMail } from "@tabler/icons-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ContainerSection } from "@/components/ui/container";
import { fadeUp, pulseGlow, pulseOpacity } from "@/lib/motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewsletterSubscribeData, NewsletterSubscribeSchema } from "@/schemas";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Field, FieldError } from "@/components/ui/field";
import { subscribeAction } from "@/actions/newsletter";
import { toast } from "sonner";
import { usePostHog } from "posthog-js/react";

export default function Newsletter() {
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");
  const posthog = usePostHog();

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center" });
    }
    if (success) {
      toast.success(success, { position: "top-center" });
    }
  }, [error, success]);

  const form = useForm<NewsletterSubscribeData>({
    resolver: zodResolver(NewsletterSubscribeSchema),
    defaultValues: {
      email: "",
      fax: "",
    },
  });
  const {
    formState: { isSubmitting },
    reset,
  } = form;

  const handleSubmit = form.handleSubmit(
    async (values: NewsletterSubscribeData) => {
      setError("");
      setSuccess("");
      let res;
      try {
        res = await subscribeAction(values);
      } catch {
        setError("Failed to subscribing.");
        posthog.capture("newsletter_error", {
          error_message: "Network or Server Catch Error",
          is_bot: values.fax !== "", // Flags if the honeypot was triggered
        });
      }
      if (res && res.success === false) {
        setError(res.message);
        posthog.capture("newsletter_error", {
          error_message: res.message,
          is_bot: values.fax !== "",
        });
      }
      if (res && res.success) {
        setSuccess(res.message);
        posthog.capture("newsletter_subscribed", {
          location: "homepage_footer", // Change this if you put the component elsewhere!
        });
      }
      setTimeout(() => setSuccess(""), 4000);
      setTimeout(() => setError(""), 4000);
      reset();
    },
  );
  return (
    <ContainerSection className="relative overflow-hidden pt-10">
      <m.div
        {...fadeUp}
        className="border-foreground/20 bg-muted/30 relative flex flex-col gap-4 overflow-hidden rounded-md border border-dashed p-5 md:p-10 md:items-center"
      >
        {/* --- THE PULSE (SOUL) --- */}
        {/* 1. Background Glow Pulse */}
        <m.div
          {...pulseGlow}
          className="pointer-events-none absolute inset-0 bg-[var(--primary)] blur-3xl"
        />

        {/* 2. Border Glow Pulse */}
        <m.div
          {...pulseOpacity}
          className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_0_20px_rgba(74,222,128,0.1)]"
        />

        <div className="relative z-10 flex flex-col gap-4 md:text-center">
          <h2 className="text-4xl font-bold tracking-tighter md:text-6xl leading-[1.15]">
            Subscribe to the <br className="hidden md:block" />
            <span className="font-semibold text-primary font-cursive italic">
              Dev Logs.
            </span>
          </h2>
          <p className="text-muted-foreground max-w-md text-sm leading-relaxed font-medium">
            Get weekly
            <span className="text-primary italic">
              {" "}
              &quot;system updates&quot;&nbsp;{" "}
            </span>
            for your learning journey and code. No spam, just pure logic and
            refactored wisdom..
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="relative">
                  {/* Honeypot hidden from humans */}
                  <input
                    {...form.register("fax")}
                    className="hidden"
                    tabIndex={-1}
                  />
                  <InputGroup
                    {...field}
                    className="h-10 w-full pr-24 rounded-xl py-6 pr-1 pl-1 border-1 border-muted-foreground/30"
                  >
                    <InputGroupAddon>
                      <IconMail className="text-primary" />
                    </InputGroupAddon>

                    <InputGroupInput
                      placeholder="john@mail.com"
                      className="bg-transparent focus:bg-transparent text-sm md:text-sm"
                    />

                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="submit"
                        disabled={isSubmitting}
                        variant="default"
                        size="sm"
                        className="bg-primary text-background hover:bg-primary/90 cursor-pointer transition-all hover:scale-95 active:scale-95"
                      >
                        {isSubmitting ? (
                          <IconLoader2 className="animate-spin size-4" />
                        ) : (
                          "Join"
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} className="pl-4" />
                )}
              </Field>
            )}
          />
        </form>
        <IconActivity className="pointer-events-none absolute -right-10 -bottom-10 lg:-right-14 lg:-bottom-15 size-54 lg:size-84 text-foreground/3 rotate-12 transition-transform group-hover:scale-110" />
      </m.div>
    </ContainerSection>
  );
}
