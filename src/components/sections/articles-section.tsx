"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  IconArrowsSort,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconLoader2,
} from "@tabler/icons-react";
import { expandXOnView, fadeUp } from "@/lib/motion";
import { ArticleCard, ArticleCardVariant } from "@/components/ui/article-card";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { PublicPost, getInfinitePosts } from "@/actions/post-action";
import ArticlesLoadingSkeleton from "@/app/(public)/articles/loading";

interface ArticlesSectionProps {
  initialArticles: PublicPost[];
  initialTotalPages: number;
  currentPage?: number;
  initialCategory?: string;
  title?: string;
  description?: string;
  categories?: { name: string; slug: string }[];
  userId?: string;
}

function ArticlesSectionContent({
  initialArticles,
  initialTotalPages,
  currentPage = 1,
  initialCategory = "All",
  title = "Articles",
  description = "Technical post-mortems, architectural refactors, and systems engineering.",
  categories,
  userId,
}: ArticlesSectionProps) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ArticleCardVariant>("grid");

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [items, setItems] = useState<PublicPost[]>(initialArticles);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validMaxPage = Math.max(1, initialTotalPages);

    // 1. Client-Side Safety Net
    if (currentPage > validMaxPage) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", validMaxPage.toString());
      nav.replace(`?${params.toString()}`, { scroll: false });
      return;
    }

    // 2. State Sync
    if (activeCategory !== initialCategory) {
      setActiveCategory(initialCategory);
    }
    setItems(initialArticles);
    setPage(currentPage);
    setTotalPages(initialTotalPages);
  }, [
    initialArticles,
    initialTotalPages,
    currentPage,
    activeCategory,
    initialCategory,
    searchParams,
    nav,
  ]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      // 💡 Use the pre-calculated DB property instead of parsing missing HTML
      const readTimeA = a.readingTime || 1;
      const readTimeB = b.readingTime || 1;

      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "readTimeHL":
          return readTimeB - readTimeA;
        case "readTimeLH":
          return readTimeA - readTimeB;
        default:
          return 0;
      }
    });
  }, [items, sortBy]);

  const handleCategoryChange = async (newCategorySlug: string) => {
    if (newCategorySlug === activeCategory) return;

    setIsLoading(true);
    setActiveCategory(newCategorySlug);

    try {
      const res = await getInfinitePosts(1, 12, newCategorySlug, userId);
      setItems(res.data);
      setPage(1);
      setTotalPages(res.totalPages);

      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      if (newCategorySlug === "All") {
        // If "All", we don't need a category param in the URL to keep it clean
        params.delete("category");
      } else {
        // Otherwise, add the category slug to the URL
        params.set("category", newCategorySlug);
      }

      nav.replace(`?${params.toString()}`, { scroll: false });
    } catch {
      return;
    }
    setIsLoading(false);
  };

  const handlePageChange = async (newPage: number) => {
    if (isLoading || newPage === page) return;

    setIsLoading(true);
    try {
      const res = await getInfinitePosts(newPage, 12, activeCategory, userId);
      setItems(res.data);
      setPage(newPage);
      setTotalPages(res.totalPages);
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete("page"); // Keep URL clean for page 1
      } else {
        params.set("page", newPage.toString());
      }
      nav.replace(`?${params.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const breadcrumbItems =
    activeCategory !== "All" && !categories
      ? [{ label: "Category", href: "/category" }, { label: title }]
      : [{ label: "Articles" }];

  return (
    <div className="md:mt-0 mt-5 flex w-full flex-col justify-start gap-y-5 max-w-full overflow-hidden">
      <SiteBreadcrumb items={breadcrumbItems} className="mb-0" />

      <div className="space-y-3">
        <m.div
          {...fadeUp}
          className="flex w-full flex-row items-center justify-between gap-2"
        >
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            {title}
          </h2>
          <m.div
            {...expandXOnView}
            className="mt-1 ml-4 h-[2px] flex-1 origin-left bg-gradient-to-r from-[var(--foreground)]/20 to-transparent"
          />
        </m.div>
        <m.p
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-sm max-w-xl"
        >
          {description}
        </m.p>
      </div>

      <m.div
        {...fadeUp}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-center lg:justify-between"
      >
        {categories && categories.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <IconFilter size={16} className="text-primary" />
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                Popular Categories:
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCategoryChange("All")}
                disabled={isLoading}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  activeCategory === "All"
                    ? "bg-primary text-background"
                    : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50",
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  disabled={isLoading}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                    activeCategory === cat.slug
                      ? "bg-primary text-background"
                      : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50",
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
            {items.length} Articles Loaded
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-dashed border-border/60 pt-4 lg:border-none lg:pt-0">
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-fit max-w-[150px] text-xs font-mono hover:bg-muted/50 transition-colors">
                <IconArrowsSort className="size-3.5 opacity-70" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectGroup>
                  <SelectLabel>Published Date</SelectLabel>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Reading Time</SelectLabel>
                  <SelectItem value="readTimeHL">Longest</SelectItem>
                  <SelectItem value="readTimeLH">Quickest</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="h-4 w-px bg-border/60 hidden md:block" />
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as "grid" | "list")}
              className="border border-[var(--border)] rounded-lg bg-background md:flex hidden"
            >
              <ToggleGroupItem value="grid" className="rounded-md px-2 h-8">
                <IconLayoutGrid size={18} />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="rounded-md px-2 h-8">
                <IconList size={18} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </m.div>

      <m.div
        layout
        className={cn(
          "grid w-full gap-6 transition-opacity duration-300",
          isLoading ? "opacity-50 pointer-events-none" : "opacity-100",
          view === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1",
        )}
      >
        <AnimatePresence mode="popLayout">
          {sortedItems.map((article) => (
            <ArticleCard
              article={article}
              variant={view}
              key={`article-section-${article.id}`}
            />
          ))}
        </AnimatePresence>

        {!isLoading && items.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center border border-dashed border-border/60 bg-muted/10 rounded-3xl">
            <h3 className="text-xl font-bold text-foreground">
              Explore the Archives
            </h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm">
              No articles published here yet.
            </p>
          </div>
        )}
      </m.div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 pb-12 relative">
          {isLoading && (
            <div className="absolute flex items-center gap-2 text-muted-foreground bg-background/80 px-4 py-2 rounded-full shadow-sm z-10 -top-4">
              <IconLoader2 className="animate-spin" size={18} />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          )}
          {/* 💡 Always using client-side pagination handler */}
          <PaginationWrapper
            totalPages={totalPages}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default function ArticlesSection(props: ArticlesSectionProps) {
  return (
    <Suspense fallback={<ArticlesLoadingSkeleton />}>
      <ArticlesSectionContent {...props} />
    </Suspense>
  );
}
