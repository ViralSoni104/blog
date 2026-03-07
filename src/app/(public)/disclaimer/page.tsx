import type { Metadata } from "next";
import { site } from "@/site";
import { ContainerSection } from "@/components/ui/container";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "How we use AI and maintain the human element in our content.",
  openGraph: {
    title: `Editorial Ethics & AI Policy · ${site.name}`,
    description: "How we use AI and maintain the human element in our content.",
    url: `${site.url}/disclaimer`,
  },
};

export default function EthicsPage() {
  return (
    <ContainerSection className="flex w-full flex-col items-center justify-center md:mt-0 mt-5">
      {/* Breadcrumb aligned to the grid width */}
      <div className="max-w-4xl w-full flex flex-col items-start mb-6">
        <SiteBreadcrumb items={[{ label: "Disclaimer" }]} />
      </div>

      <div className="max-w-4xl w-full space-y-8 text-muted-foreground leading-relaxed">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Editorial Ethics & AI Policy
        </h1>
        <p className="text-lg font-medium text-foreground/80">
          Transparency is a core feature, not a bug. Here is exactly how content
          is created on {site.name}.
        </p>

        <div className="space-y-8 pt-4">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. The Human Element First
            </h2>
            <p>
              Every article, code snippet, and logic breakdown on this site
              originates from a real human experience. Whether it&apos;s a bug I
              spent hours debugging, a concept I struggled to learn, or a side
              project I built, the{" "}
              <strong className="text-foreground">
                core narrative and technical logic are 100% human.
              </strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. How Artificial Intelligence is Used
            </h2>
            <p>
              I leverage AI (like ChatGPT or Gemini) as an editorial assistant.
              It is used strictly for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-foreground">
                  Drafting & Structuring:
                </strong>{" "}
                Helping organize my raw thoughts and notes into readable
                outlines.
              </li>
              <li>
                <strong className="text-foreground">Grammar & Clarity:</strong>{" "}
                Proofreading for typos, flow, and readability.
              </li>
              <li>
                <strong className="text-foreground">Code Formatting:</strong>{" "}
                Ensuring code snippets are cleanly formatted and commented.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. What AI Does NOT Do
            </h2>
            <p>
              AI is never used to generate the core ideas, fabricate
              experiences, or write tutorials about technologies I haven&apos;t
              personally used. Every piece of code shared has been tested and
              executed by me.
            </p>
          </section>
        </div>

        <div className="pt-8">
          <hr className="mb-6 border-border" />
          <p className="text-sm italic">
            TL;DR: The stories are mine. The code is tested. The AI just helps
            me edit so you don&apos;t have to read my typos.
          </p>
        </div>
      </div>
    </ContainerSection>
  );
}
