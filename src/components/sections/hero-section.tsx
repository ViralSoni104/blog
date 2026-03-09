"use client";
import { m } from "framer-motion";
import {
  IconArticleFilled,
  IconBook,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { ContainerSection } from "@/components/ui/container";
import Link from "next/link";
import { containerVariants, expandWidth, itemVariants } from "@/lib/motion";
import { BorderBeam } from "../ui/border-beam";

interface Props {
  latestArticleSlug: string;
}
export default function Hero({ latestArticleSlug }: Props) {
  return (
    <ContainerSection className="h-full min-h-[calc(100svh-5.5rem)] md:min-h-0 relative mt-5 py-8 flex flex-col items-center justify-center gap-10 md:gap-8 border-none">
      {/* Top Metadata */}

      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
      linear-gradient(to right, var(--foreground) 1px, transparent 1px),
      linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
    `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
      repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
      repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
      radial-gradient(ellipse 60% 60% at 50% 50%, var(--background) 30%, transparent 70%)
    `,
          WebkitMaskImage: `
      repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px),
      repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px),
      radial-gradient(ellipse 60% 60% at 50% 50%, var(--background) 30%, transparent 70%)
    `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="flex justify-between w-full text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-medium px-4">
        <div className="flex flex-row items-center justify-center gap-3">
          <div className="animate-ping bg-green-500 dot h-1.5 w-1.5"></div>
          ACTIVE
        </div>
        <span>Storytelling</span>
      </div>

      <m.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center gap-10 md:gap-8 w-full"
      >
        {latestArticleSlug && (
          <Link href={"/articles/" + latestArticleSlug}>
            <m.div
              variants={itemVariants}
              className="mb-0 relative overflow-hidden" // Pushes badge to top on mobile
            >
              <Button
                size="sm"
                variant="outline"
                className="... relative overflow-hidden"
              >
                <IconArticleFilled className="size-4" />
                <span>Read the latest article</span>
                <IconChevronRight strokeWidth={1.5} className="size-4" />
                <BorderBeam
                  size={55}
                  duration={8}
                  borderWidth={2}
                  className="from-transparent via-primary to-transparent"
                />
              </Button>
            </m.div>
          </Link>
        )}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <m.div variants={itemVariants}>
            <h1 className="text-6xl md:text-8xl leading-[0.9] tracking-tighter font-semibold">
              <span className="block text-foreground select-none">
                Refactoring
              </span>
              <span className="relative inline-block font-cursive italic text-primary mt-4 md:mt-2">
                chaos
                {/* Subtle underline decoration */}
                <m.div
                  variants={expandWidth}
                  initial="initial"
                  animate="animate"
                  className="absolute -bottom-2 left-0 h-[2px] bg-primary/30"
                />
              </span>
              <span className="block text-foreground mt-4 md:mt-2">
                into clarity.
              </span>
            </h1>
          </m.div>

          <m.p
            variants={itemVariants}
            className="mt-10 text-md md:text-lg text-muted-foreground text-balance max-w-xl mx-auto"
          >
            Documenting the journey of modern web development, untangling
            complex code, and exploring the human side of software engineering.
          </m.p>
        </div>

        {/* Bottom Metadata */}
        <div className="flex justify-center w-full text-[10px] uppercase tracking-[0.4em] text-muted-foreground font-medium px-4">
          <Link
            href="#trending-start"
            className="relative z-10 flex items-center gap-2"
          >
            <Button
              size="lg"
              variant="outline"
              className="group hover:bg-chart-1 text-background bg-primary hover:text-background relative flex cursor-pointer items-center justify-center p-5 text-xs font-bold tracking-widest uppercase transition-all duration-300 active:scale-95"
            >
              Start Reading{" "}
              <IconBook
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-12"
              />
              <BorderBeam
                size={55}
                duration={8}
                borderWidth={2}
                className="from-transparent via-foreground to-transparent"
              />
            </Button>
          </Link>
        </div>
      </m.div>
    </ContainerSection>
  );
}
