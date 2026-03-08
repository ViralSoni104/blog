"use client";

import React from "react";
import { m } from "framer-motion";
import Link from "next/link";
import {
  IconActivity,
  IconArrowUpRight,
  IconHash,
  IconArrowRight,
} from "@tabler/icons-react";
import { ContainerSection } from "@/components/ui/container";
import {
  expandXOnView,
  fadeInOnView,
  fadeUp,
  slideInRightOnView,
} from "@/lib/motion";
import { ArticleCard } from "@/components/ui/article-card";
import { PublicPost } from "@/actions/post-action";

interface LatestArticlesProps {
  articles: PublicPost[]; // 💡 Renamed for simplicity since it's no longer just "initial"
  popularCategories: { name: string; slug: string }[];
}

export default function LatestArticles({
  articles,
  popularCategories,
}: LatestArticlesProps) {
  return (
    <ContainerSection className="flex w-full flex-col justify-center border-b border-muted-foreground/30 border-dashed py-10">
      {/* 1. Header with Line Animation */}
      <div className="mb-8 flex flex-col">
        <m.div {...fadeInOnView} className="flex flex-row items-center gap-1">
          <div className="relative">
            <IconActivity className="mr-0.5 mt-0.5 size-6 md:size-7 text-[var(--primary)] drop-shadow-[0_0_4px_var(--chart-1)]/40 filter" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Latest{" "}
            <span className="font-cursive italic ml-1.5 text-[var(--primary)]">
              Articles
            </span>
          </h2>
          <m.div
            {...expandXOnView}
            className="mt-1 ml-4 h-[2px] flex-1 origin-left bg-gradient-to-r from-[var(--foreground)]/20 to-transparent"
          />
        </m.div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* 2. Main Article Feed */}
        <div className="col-span-1 flex flex-col gap-6 md:col-span-3">
          {articles.length > 0 ? (
            articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                variant="list"
                motionProps={fadeUp}
                id={index === 0 ? "latest-start" : undefined}
              />
            ))
          ) : (
            <div className="py-10 text-center text-sm font-mono text-muted-foreground border border-dashed rounded-2xl">
              No articles published yet.
            </div>
          )}

          {/* 💡 Replaced "Load More" with a static "View All" Link */}
          {articles.length > 0 && (
            <div className="flex justify-center mt-2 pt-6 border-t border-dashed border-muted-foreground/20">
              <Link
                href="/articles"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-transparent p-3 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  Explore all articles
                </span>
                <IconArrowRight
                  size={16}
                  className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                />
              </Link>
            </div>
          )}
        </div>

        {/* 3. Sidebar / Popular Categories */}
        <aside className="col-span-1 hidden flex-col border-l border-dashed border-muted-foreground/30 pl-5 md:flex">
          <m.div {...fadeUp} className="mb-2">
            <div className="flex items-center gap-2 mb-0">
              <h3 className="text-lg hover:underline font-mono font-bold text-foreground">
                Popular Categories
              </h3>
            </div>
          </m.div>

          <nav className="flex flex-col gap-1">
            {popularCategories.map((cat, index) => (
              <m.div key={cat.slug} {...slideInRightOnView(index * 0.05)}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="group flex items-center justify-between rounded-lg p-3 transition-all hover:bg-primary/5 border border-transparent hover:border-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <IconHash
                      size={14}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    />
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                      {cat.name}
                    </span>
                  </div>
                  <IconArrowUpRight
                    size={16}
                    className="opacity-0 -translate-y-1 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 text-primary"
                  />
                </Link>
              </m.div>
            ))}
            {popularCategories.length > 0 && (
              <m.div {...slideInRightOnView(0.5)} className="mt-4">
                <Link
                  href="/category"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-transparent p-3 transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    Explore all topics
                  </span>
                  <IconArrowRight
                    size={16}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                  />
                </Link>
              </m.div>
            )}
          </nav>
        </aside>
      </div>
    </ContainerSection>
  );
}
