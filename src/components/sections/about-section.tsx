"use client";

import { m } from "framer-motion";
import { AuroraText } from "@/components/ui/aurora-text";
import { ContainerSection } from "@/components/ui/container";
import { containerVariants, itemVariants } from "@/lib/motion";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { IconTimelineEventExclamation } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { PILLARS } from "@/lib/constants";

export default function About() {
  return (
    <ContainerSection className="mt-5 md:mt-0">
      <SiteBreadcrumb
        items={[{ label: "About" }]}
        className="mb-0 px-1.5 md:px-1"
      />

      <div className="flex flex-col gap-16 md:gap-24 pb-10">
        {/* SECTION 1: The Editorial Hero (Split Layout) */}
        {/* 💡 Note how the parent handles 'hidden' and 'visible' for the children */}
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="flex flex-col justify-between gap-8 pt-6 lg:flex-row lg:items-end lg:gap-12 md:pt-10"
        >
          {/* Left Side: Huge Headline */}
          <m.h1
            variants={itemVariants}
            className="text-4xl font-extrabold leading-[1.05] tracking-tighter text-foreground text-balance md:text-6xl lg:text-7xl"
          >
            Crafting the web, <br className="hidden md:block" />
            <span className="relative mt-2 block whitespace-normal md:mt-1 md:inline md:whitespace-nowrap">
              <AuroraText
                speed={0.4}
                colors={["#4ade80", "#5f8a77", "#94a3b8", "#0891b2"]}
                className="font-cursive italic font-semibold pr-4"
              >
                line by line.
              </AuroraText>
            </span>
          </m.h1>

          {/* Right Side: Description */}
          <m.div
            variants={itemVariants}
            className="mt-4 w-full space-y-6 lg:max-w-sm lg:pb-3 md:mt-0"
          >
            <p className="text-base font-medium leading-relaxed text-muted-foreground md:text-lg">
              An independent technical journal dedicated to the messy,
              unfiltered reality of learning, building, and shipping web
              applications.
            </p>
            {/* SaaS decorative line to ground the text */}
            <div className="flex items-center gap-4 opacity-70">
              <div className="h-[1px] flex-1 bg-border/80" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/80">
                Read the Logs
              </span>
            </div>
          </m.div>
        </m.div>

        {/* SECTION 2: The Manifesto (Split Layout) */}
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-8 border-t border-border/40 pt-12 lg:grid-cols-12 lg:gap-12 md:pt-16"
        >
          <m.div variants={itemVariants} className="lg:col-span-4">
            {/* Primary Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <IconTimelineEventExclamation
                className="size-4"
                strokeWidth={2}
              />
              The Manifesto
            </div>
          </m.div>

          <m.div
            variants={itemVariants}
            className="space-y-6 text-base leading-relaxed text-muted-foreground text-pretty lg:col-span-8 md:text-lg"
          >
            {/* High Contrast Lead Paragraph */}
            <p className="text-xl font-semibold leading-snug tracking-tight text-foreground md:text-2xl text-balance">
              The internet is full of AI-generated tutorials telling you{" "}
              <span className="text-primary italic mr-1">what</span> to type.
              This journal is about{" "}
              <span className="text-primary italic mx-1">why</span> we type it.
            </p>
            <p className="max-w-3xl">
              When you are stuck on a frustrating bug or trying to wrap your
              head around a new framework, reading a generic documentation page
              doesn&apos;t always help. You need to see the thought process. You
              need to understand the logic, the missteps, and the eventual
              solution.
            </p>
            <p className="max-w-3xl">
              This site is my public notebook. I am documenting my journey
              through web development—exploring code logic, building projects,
              and sharing the friction and triumphs of becoming a better
              software engineer.
            </p>
          </m.div>
        </m.div>

        {/* SECTION 3: The Content Pillars (Modern Bento-style Grid) */}
        <m.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="space-y-8 border-t border-border/40 pt-12 md:space-y-10 md:pt-16"
        >
          <m.h3
            variants={itemVariants}
            className="text-2xl font-bold tracking-tight text-foreground md:text-3xl"
          >
            What to expect
          </m.h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PILLARS.map((pillar, idx) => (
              <m.div
                key={idx}
                variants={itemVariants}
                className={cn(
                  "group relative overflow-hidden rounded-3xl p-6 transition-all duration-300 ease-out md:p-8",
                  "bg-card border border-border/40 hover:border-primary/30",
                  "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
                )}
              >
                {/* Subtle overlay gradient to make the card feel alive on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/50 bg-muted/50 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:border-primary/20 group-hover:bg-primary/10">
                    <pillar.icon
                      className={cn(
                        pillar.className,
                        "transition-colors group-hover:text-primary",
                      )}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h4 className="mb-3 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary md:text-xl">
                    {pillar.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {pillar.description}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </ContainerSection>
  );
}
