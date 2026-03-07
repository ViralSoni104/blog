import type { Metadata } from "next";
import { site } from "@/site";
import { ContainerSection } from "@/components/ui/container";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses, and protects your data.`,
  openGraph: {
    title: `Privacy Policy · ${site.name}`,
    description: `How ${site.name} collects, uses, and protects your data.`,
    url: `${site.url}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <ContainerSection className="flex w-full flex-col items-center justify-center md:mt-0 mt-5">
      <div className="max-w-4xl w-full flex flex-col items-start mb-6">
        <SiteBreadcrumb items={[{ label: "Privacy Policy" }]} />
      </div>
      <div className="max-w-4xl w-full space-y-8 text-muted-foreground leading-relaxed">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p>Last updated: February 28, 2026</p>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when you create
              an account, subscribe to our newsletter, or leave a comment. This
              includes your name, email address, and profile image (provided via
              your authentication method like Google or GitHub).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our website.</li>
              <li>
                Send you our newsletter (only if you have explicitly
                subscribed).
              </li>
              <li>
                Authenticate your account to allow commenting and bookmarking.
              </li>
              <li>Monitor and analyze trends, usage, and activities.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Cookies and Tracking
            </h2>
            <p>
              We use strictly necessary cookies to maintain your authenticated
              session. We do not use third-party tracking cookies or sell your
              personal data to advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Your Data Rights
            </h2>
            <p>
              You have the right to request access to the personal data we hold
              about you, to ask that your personal data be corrected, updated,
              or deleted. You can delete your account and all associated data at
              any time via your settings dashboard, or by contacting us
              directly.
            </p>
          </section>
        </div>
      </div>
    </ContainerSection>
  );
}
