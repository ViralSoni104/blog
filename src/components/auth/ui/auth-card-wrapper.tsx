"use client";

import { m } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { FieldSeparator } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/route";
import { socialMediaButtons } from "@/lib/constants";
import Link from "next/link";
import { IconArrowNarrowLeft, IconLock, TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";
import { usePostHog } from "posthog-js/react";

interface CardWrapperProps {
  children: React.ReactNode;
  headerTitle: string;
  headerLabel: string;
  backButtonSubLabel?: string;
  backButtonMainLabel?: string;
  backButtonHref?: string;
  showSocial?: boolean;
  showBackButtonArrow?: boolean;
  showBorder?: boolean;
  pageName?: string;
  pageIcon?: TablerIcon;
}

const CardWrapperContent = ({
  children,
  headerTitle,
  headerLabel,
  backButtonSubLabel,
  backButtonMainLabel,
  backButtonHref,
  showSocial,
  showBackButtonArrow,
  showBorder,
  pageName,
  pageIcon,
}: CardWrapperProps) => {
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const callbackUrl = searchParams.get("callbackUrl");
  const onSocialClick = (type: string) => {
    posthog.capture("oauth_login_started", {
      provider: type, // "google" or "github"
      context: pageName, // Lets you know if they clicked it on the Login or Signup page
    });
    signIn(type, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  };
  return (
    <div className="w-full max-w-[600px] mx-auto space-y-4 px-4 py-8">
      <SiteBreadcrumb
        className="mb-0"
        items={[
          { label: "Auth", icon: IconLock },
          { label: pageName, icon: pageIcon ? pageIcon : undefined },
        ]}
      />
      <m.div
        {...fadeUp}
        className={cn(
          "border-muted-foreground/20 rounded-3xl md:p-8",
          showBorder ? "p-6 border shadow-xl" : "md:p-6 md:border md:shadow-xl",
        )}
      >
        {/* Header Section */}
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {headerTitle}
          </h1>
          <p className="text-muted-foreground text-sm">{headerLabel}</p>
        </div>

        {/* Social Buttons Section */}
        {showSocial && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-6">
              {socialMediaButtons.map((o) => (
                <Button
                  key={o.label}
                  variant="outline"
                  type="button"
                  onClick={() => onSocialClick(o.type.toLowerCase())}
                  className="rounded-xl h-12 gap-2 border-muted-foreground/30 hover:border-primary/50 transition-all font-medium"
                >
                  <o.icon className="size-5" />
                  <span className="">{o.label}</span>
                </Button>
              ))}
            </div>
            <FieldSeparator className="mb-6 opacity-60 text-xs">
              Or continue with
            </FieldSeparator>
          </>
        )}

        {/* Form or Status Content */}
        {children}

        {/* Footer Navigation */}
        {backButtonHref && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              href={backButtonHref}
              className={cn(
                "font-medium transition-all flex items-center justify-center gap-1",
                showBackButtonArrow
                  ? "hover:gap-1.5 border border-muted-foreground/10 bg-muted rounded-lg p-3 text-foreground"
                  : "hover:underline",
              )}
            >
              {showBackButtonArrow && (
                <IconArrowNarrowLeft
                  strokeWidth={1.75}
                  className="size-5 transition-transform group-hover:-translate-x-1"
                />
              )}
              {backButtonSubLabel}
              <span className="text-primary font-semibold ">
                {backButtonMainLabel}
              </span>
            </Link>
          </div>
        )}
      </m.div>
    </div>
  );
};

export function CardWrapper(props: CardWrapperProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CardWrapperContent {...props} />
    </Suspense>
  );
}
