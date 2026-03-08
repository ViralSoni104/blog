"use client";

import { AnimatePresence, m } from "framer-motion";
import { ContainerSection } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconSend,
} from "@tabler/icons-react";
import { emailContact, socialLinks } from "@/lib/constants";
import { useState } from "react";
import Link from "next/link";
import { copyToClipboard, cn } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContactFormData, ContactFormSchema } from "@/schemas";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormMessage } from "../auth/ui/auth-form-message";
import { Textarea } from "../ui/textarea";
import { sendContactMailAction } from "@/actions/send-contact-mail";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>("");
  const [success, setSuccess] = useState<string | null>("");

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      fax: "",
    },
  });

  const {
    formState: { isSubmitting },
    reset,
  } = form;

  const handleSubmit = form.handleSubmit(async (values: ContactFormData) => {
    setError("");
    setSuccess("");
    try {
      const res = await sendContactMailAction(values);
      if (res && res.success === false) {
        setError(res.message);
      }
      if (res && res.success) {
        setSuccess(res.message);
      }
      setTimeout(() => setSuccess(""), 4000);
      reset();
    } catch {
      setError("Failed to send message.");
    }
  });

  const handleCopy = async () => {
    const success = await copyToClipboard(emailContact);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopied(false);
    }
  };

  return (
    <ContainerSection>
      <SiteBreadcrumb
        items={[{ label: "Contact" }]}
        className="px-1.5 md:px-1 mt-5 md:mt-0"
      />
      <div className="mx-auto mt-4 grid grid-cols-1 gap-12 p-2 lg:grid-cols-12 md:mt-8">
        {/* LEFT SIDE: Contact Info */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-12 lg:col-span-4"
        >
          {/* Email Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Direct Email
            </h3>
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${emailContact}`}
                className="text-lg font-medium tracking-tight transition-colors hover:text-primary md:text-xl"
              >
                {emailContact}
              </a>
              <button
                onClick={handleCopy}
                className="group flex h-8 w-8 items-center justify-center rounded-md border border-border/50 bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                aria-label="Copy email address"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <m.div
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconCheck size={16} className="text-emerald-500" />
                    </m.div>
                  ) : (
                    <m.div
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconCopy
                        size={16}
                        className="transition-transform group-hover:scale-110"
                      />
                    </m.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* Socials Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
              Connect
            </h3>
            <div className="flex flex-col gap-3">
              {socialLinks.map((social, i) => (
                <m.div
                  key={social.name + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.1 + 0.2,
                    ease: "easeOut",
                  }}
                >
                  <Link
                    href={social.link}
                    className={`group flex w-fit items-center gap-1.5 text-muted-foreground transition-all duration-300 hover:translate-x-1 ${social.color}`}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md bg-muted/40 transition-colors",
                        social.color,
                      )}
                    >
                      <social.icon size={18} className={`${social.color}`} />
                    </div>
                    <span className="font-medium">{social.name}</span>
                    <IconArrowRight
                      size={16}
                      className={`-rotate-45 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 ${social.color}`}
                    />
                  </Link>
                </m.div>
              ))}
            </div>
          </div>
        </m.div>

        {/* RIGHT SIDE: SaaS Form */}
        <m.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="lg:col-span-8 lg:pl-8"
        >
          <div className="mb-8 md:mb-10">
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Get in touch
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Have an interesting topic to discuss or a project in mind?
              I&apos;d love to hear from you. Fill out the form below and
              I&apos;ll get back to you shortly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                        Name
                      </FieldLabel>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="John Doe"
                        className="h-12 rounded-xl border-border/50 bg-muted/40 px-4 text-base transition-all placeholder:text-muted-foreground/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="mt-1.5"
                        />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="hello@example.com"
                        className="h-12 rounded-xl border-border/50 bg-muted/40 px-4 text-base transition-all placeholder:text-muted-foreground/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                      />
                      {fieldState.invalid && (
                        <FieldError
                          errors={[fieldState.error]}
                          className="mt-1.5"
                        />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="message"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                      Message
                    </FieldLabel>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder="How can I help you?"
                      className="min-h-[140px] resize-y rounded-xl border-border/50 bg-muted/40 p-4 text-base transition-all placeholder:text-muted-foreground/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="mt-1.5"
                      />
                    )}
                  </Field>
                )}
              />

              {/* Honeypot Field */}
              <div
                aria-hidden="true"
                className="absolute left-0 top-0 -z-50 h-0 w-0 overflow-hidden opacity-0"
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  placeholder="Fax number"
                  {...form.register("fax")}
                />
              </div>

              <Button
                disabled={isSubmitting}
                className="group mt-2 h-12 w-full rounded-xl font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 md:w-auto md:px-8"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <IconLoader2 className="size-5 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Send Message</span>
                    <IconSend
                      className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={2}
                    />
                  </div>
                )}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-6">
            <FormMessage error={error} success={success} />
          </div>
        </m.div>
      </div>
    </ContainerSection>
  );
}
