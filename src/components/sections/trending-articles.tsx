"use client";

import { m } from "framer-motion";
import { IconFlameFilled } from "@tabler/icons-react";
import { ContainerSection } from "@/components/ui/container";
import { expandXOnView, fadeInOnView, fadeUp } from "@/lib/motion";
import { ArticleCard } from "@/components/ui/article-card";
import { PublicPost } from "@/actions/post-action";

interface TrendingArticlesProps {
  articles: PublicPost[];
}

export default function TrendingArticles({ articles }: TrendingArticlesProps) {
  return (
    <ContainerSection className="border-y border-muted-foreground/30 py-10 border-dashed flex w-full flex-col justify-center">
      {/* Header Fade-in */}
      <m.div {...fadeInOnView} className="mb-8 flex flex-col">
        <div className="flex flex-row items-center justify-center gap-1">
          <IconFlameFilled className="text-primary mt-0.5 size-6 md:size-7 drop-shadow-[0_0_4px_var(--chart-1)]/40 filter" />
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Trending{" "}
            <span className="font-cursive italic ml-1.5 text-[var(--primary)]">
              Articles
            </span>
          </h2>
          {/* Soul: The line expands when viewed */}
          <m.div
            {...expandXOnView}
            className="mt-1 ml-4 h-[2px] flex-1 origin-left bg-gradient-to-r from-[var(--foreground)]/20 to-transparent"
          />
        </div>
      </m.div>

      {/* Grid: No stagger here so they act independently based on scroll position */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant="grid"
              motionProps={fadeUp}
              id={index === 0 ? "trending-start" : undefined}
            />
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-sm font-mono text-muted-foreground border border-dashed rounded-2xl">
            Not enough data to show trending articles yet.
          </div>
        )}
      </div>
    </ContainerSection>
  );
}
