import type { Metadata } from "next";
import { site } from "@/site";
import { ContainerSection } from "@/components/ui/container";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: `Terms of use for accessing and interacting with ${site.name}.`,
  openGraph: {
    title: `Terms and Conditions · ${site.name}`,
    description: `Terms of use for accessing and interacting with ${site.name}.`,
    url: `${site.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <ContainerSection className="flex w-full flex-col items-center justify-center md:mt-0 mt-5">
      <div className="max-w-4xl w-full flex flex-col items-start mb-6">
        <SiteBreadcrumb items={[{ label: "Terms of Service" }]} />
      </div>
      <div className="max-w-4xl w-full space-y-8 text-muted-foreground leading-relaxed">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Terms and Conditions
        </h1>
        <p>Last updated: February 28, 2026</p>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using {site.name}, you accept and agree to be
              bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Intellectual Property
            </h2>
            <p>
              All content published on this website, including articles, code
              snippets, graphics, and logos, is the property of {site.name} and
              is protected by copyright laws. You may not reproduce, distribute,
              or create derivative works without explicit permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. User Conduct and Comments
            </h2>
            <p>
              If you create an account to leave comments, you agree to treat
              other users with respect. We reserve the right to remove any
              comments that are spam, abusive, promotional, or otherwise violate
              community standards. We also reserve the right to terminate user
              accounts without notice for violating these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Disclaimer of Warranties
            </h2>
            <p>
              The code examples, tutorials, and insights provided on this blog
              are for educational purposes. {site.name} makes no warranties
              regarding the accuracy or reliability of the information provided.
              Use the code at your own risk.
            </p>
          </section>
        </div>
      </div>
    </ContainerSection>
  );
}
