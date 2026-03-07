"use client";

import React, {
  useState,
  useEffect,
  useTransition,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  IconArrowsSort,
  IconLayoutGrid,
  IconList,
  IconLoader2,
  IconSearch,
  IconArticle,
  IconFolder,
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
import { Input } from "@/components/ui/input";

// Strictly Typed Imports (No 'any')
import type {
  AdvancedSearchResult,
  AdvancedSearchCategoryResult,
} from "@/actions/search-action";
import type { PublicPost } from "@/actions/post-action";
import CategoryCard from "../ui/category-card";
import { usePostHog } from "posthog-js/react";

interface Props {
  searchType: "articles" | "categories";
  postData: AdvancedSearchResult[];
  categoryData: AdvancedSearchCategoryResult[];
  initialTotalPages: number;
  initialTotalItems: number;
  isZeroState?: boolean;
}

export function AdvancedSearchContent({
  searchType,
  postData,
  categoryData,
  initialTotalPages,
  initialTotalItems,
  isZeroState = false,
}: Props) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URL State
  const currentQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPage = Number(searchParams.get("page")) || 1;
  const posthog = usePostHog();
  // Local UI State
  const lastTrackedQuery = useRef<string>("");
  const [view, setView] = useState<ArticleCardVariant>("grid");
  const [inputValue, setInputValue] = useState(currentQuery);

  useEffect(() => {
    const normalizedQuery = currentQuery.trim().toLowerCase();

    // 💡 2. Only fire IF it's a real query AND it doesn't match the last tracked query
    if (
      !isZeroState &&
      normalizedQuery.length > 0 &&
      lastTrackedQuery.current !== normalizedQuery
    ) {
      posthog.capture("search_executed", {
        query: normalizedQuery,
        source: "advanced_page",
        search_type: searchType,
        sort_method: currentSort,
        result_count: initialTotalItems,
      });

      // 💡 3. Save the query to our ref.
      // Now, changing tabs or switching Chrome windows won't trigger another event!
      lastTrackedQuery.current = normalizedQuery;
    }
  }, [
    currentQuery,
    searchType,
    currentSort,
    initialTotalItems,
    isZeroState,
    posthog,
  ]);

  const updateUrlParams = useCallback(
    (updates: Record<string, string>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
          if (value && value !== "") params.set(key, value);
          else params.delete(key);
        });

        nav.push(`/search?${params.toString()}`, { scroll: false });
      });
    },
    [searchParams, nav],
  );

  // Safety Net for out-of-bounds pages
  useEffect(() => {
    const validMaxPage = Math.max(1, initialTotalPages);
    if (currentPage > validMaxPage && initialTotalPages > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", validMaxPage.toString());
      nav.replace(`/search?${params.toString()}`, { scroll: false });
    }
  }, [currentPage, initialTotalPages, searchParams, nav]);

  // Debounce Text Search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (inputValue !== currentQuery) {
        updateUrlParams({ q: inputValue, page: "1" });
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [inputValue, currentQuery, updateUrlParams]);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  const breadcrumbItems = [{ label: "Search" }];

  return (
    <div className="md:mt-0 mt-5 flex w-full flex-col justify-start gap-y-5 max-w-full overflow-hidden">
      <SiteBreadcrumb items={breadcrumbItems} className="mb-0" />

      {/* 1. Header Area */}
      <div className="pb-2 space-y-3">
        <m.div
          {...fadeUp}
          className="flex w-full flex-row items-center justify-between gap-2"
        >
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Search
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
          Search and filter through all published articles and categories.
        </m.p>
      </div>

      {/* 2. Combined Unified Control Row (Tabs + Search + Sort/View) */}
      <m.div
        {...fadeUp}
        transition={{ delay: 0.1 }}
        // Mobile: Flex column (stacked). Desktop: Flex row (horizontal).
        className="flex flex-col md:flex-row items-center gap-3 w-full border-b border-border/60 pb-6"
      >
        {/* A. Tabs */}
        <div className="flex w-full md:w-auto p-1 bg-muted/30 border border-border/50 rounded-md gap-1 shrink-0">
          <button
            onClick={() => updateUrlParams({ type: "articles", page: "1" })}
            disabled={isPending}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1 rounded-sm text-sm font-semibold transition-all",
              searchType === "articles"
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <IconArticle size={16} />
            Articles
          </button>
          <button
            onClick={() => updateUrlParams({ type: "categories", page: "1" })}
            disabled={isPending}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1 rounded-sm text-sm font-semibold transition-all",
              searchType === "categories"
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <IconFolder size={16} />
            Categories
          </button>
        </div>

        {/* B. Search Input (Flex-1 makes it stretch to fill middle space on desktop) */}
        <div className="relative w-full md:flex-1 shrink-0 md:shrink">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Search ${searchType}...`}
            className="pl-12 h-9 bg-muted/30 border-muted-foreground/20 rounded-md text-base shadow-sm focus-visible:ring-primary/50 w-full"
          />
        </div>

        {/* C. Sort & Grid Toggle (Only for Articles) */}
        {searchType === "articles" && (
          <div className="flex items-center gap-3 h-full w-full md:w-auto shrink-0">
            <Select
              value={currentSort}
              onValueChange={(val) => updateUrlParams({ sort: val, page: "1" })}
              disabled={isPending || !inputValue}
            >
              <SelectTrigger className="h-9 w-[140px] md:w-[170px] bg-muted/30 border-muted-foreground/20 rounded-md hover:bg-muted/50 transition-colors shadow-sm text-xs font-mono">
                <IconArrowsSort className="size-4 opacity-70" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectGroup>
                  <SelectLabel>Published Date</SelectLabel>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Engagement</SelectLabel>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Separator line & View toggle (Hidden on Mobile) */}
            <div className="h-6 w-px bg-border/60 hidden md:block" />

            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as "grid" | "list")}
              className={cn(
                "h-9 border border-[var(--border)] rounded-lg bg-background md:flex hidden items-center shadow-sm shrink-0 transition-opacity",
                (!inputValue || isPending) && "opacity-50 pointer-events-none", // 💡 FIX: Disabled visually when empty
              )}
            >
              <ToggleGroupItem value="grid" className="rounded-lg h-9">
                <IconLayoutGrid size={18} />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="rounded-lg h-9">
                <IconList size={18} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </m.div>

      {/* 3. Results Info */}
      <div className="flex items-center justify-between text-sm font-mono text-muted-foreground mt-2">
        <p>
          Found {initialTotalItems} {searchType}{" "}
          {currentQuery && `for "${currentQuery}"`}
        </p>
        {isPending && (
          <IconLoader2 className="animate-spin size-4 text-primary" />
        )}
      </div>

      {/* 4. Results Grid */}
      <m.div
        layout
        className={cn(
          "grid w-full gap-6 transition-opacity duration-300",
          isPending ? "opacity-50 pointer-events-none" : "opacity-100",
          searchType === "articles" && view === "grid" && !isZeroState
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1",
          searchType === "categories" && !isZeroState
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "",
        )}
      >
        <AnimatePresence mode="popLayout">
          {searchType === "articles"
            ? postData.map((post) => (
                <m.div
                  key={post.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                >
                  <ArticleCard
                    article={post as unknown as PublicPost}
                    variant={view}
                  />
                </m.div>
              ))
            : categoryData.map((category) => (
                <m.div
                  key={category.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                >
                  {/* Category Card Design */}
                  <CategoryCard category={category} />
                </m.div>
              ))}
        </AnimatePresence>

        {/* 💡 Friendly ZERO STATE Prompt */}
        {!isPending && isZeroState && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center border border-dashed border-border/60 bg-muted/10 rounded-3xl">
            <IconSearch className="size-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold text-foreground">
              Explore the Archives
            </h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm">
              Type a keyword above to search through articles and categories, or
              use the filters to browse.
            </p>
          </div>
        )}

        {/* NO RESULTS Prompt */}
        {!isPending && !isZeroState && initialTotalItems === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground font-mono text-sm border border-dashed border-foreground/30 rounded-2xl">
            No {searchType} found matching your criteria.
          </div>
        )}
      </m.div>

      {/* 5. Pagination */}
      {initialTotalPages > 1 && (
        <div className="flex justify-center mt-6 pb-12 relative">
          {isPending && (
            <div className="absolute flex items-center gap-2 text-muted-foreground bg-background/80 px-4 py-2 rounded-full shadow-sm z-10 -top-4">
              <IconLoader2 className="animate-spin" size={18} />
              <span className="text-sm font-medium">Updating...</span>
            </div>
          )}
          <PaginationWrapper
            currentPage={currentPage}
            totalPages={initialTotalPages}
            onPageChange={(p) => updateUrlParams({ page: p.toString() })}
          />
        </div>
      )}
    </div>
  );
}
