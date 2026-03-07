"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  IconArrowsSort,
  IconLayoutGrid,
  IconList,
  IconLoader2,
} from "@tabler/icons-react";
import CategoryCard from "@/components/ui/category-card";
import { expandXOnView, fadeUp } from "@/lib/motion";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select";
import { CategoryWithCount } from "@/schemas";
import { getInfiniteCategories } from "@/actions/category-actions";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper"; // 💡 Imported wrapper
import { useRouter, useSearchParams } from "next/navigation";
import LoadingCategories from "@/app/(public)/category/loading";

interface CategoriesSectionProps {
  initialCategories: CategoryWithCount[];
  initialTotalPages: number; // 💡 Replaced initialHasNextPage
  currentPage?: number; // 💡 Added to sync with server
}

function CategoriesSectionContent({
  initialCategories,
  initialTotalPages,
  currentPage = 1,
}: CategoriesSectionProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const nav = useRouter(); // 💡 Initialize router
  const searchParams = useSearchParams(); //
  // Pagination State
  const [items, setItems] = useState<CategoryWithCount[]>(initialCategories);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  // Sync local state with server props when URL changes
  useEffect(() => {
    const validMaxPage = Math.max(1, initialTotalPages);
    const params = new URLSearchParams(searchParams.toString());
    const paramsPage = Number(params.get("page")) || 1;

    // Client-side out-of-bounds safety net
    if (paramsPage > validMaxPage) {
      params.set("page", validMaxPage.toString());
      nav.replace(`?${params.toString()}`, { scroll: false });
      return;
    }

    setItems(initialCategories);
    setPage(currentPage);
    setTotalPages(initialTotalPages);
  }, [initialCategories, initialTotalPages, currentPage, nav, searchParams]);

  // Client-Side Sorting Engine
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      const countA = a._count?.posts || 0;
      const countB = b._count?.posts || 0;

      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "readTimeHL":
          return countB - countA;
        case "readTimeLH":
          return countA - countB;
        default:
          return 0;
      }
    });
  }, [items, sortBy]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  // Client-Side Pagination Handler
  const handlePageChange = async (newPage: number) => {
    if (isLoading || newPage === page) return;

    setIsLoading(true);
    let res;
    try {
      // 💡 Replace items entirely instead of appending
      res = await getInfiniteCategories(newPage, 12, "newest");
      setItems(res.data);
      setPage(newPage);
      setTotalPages(res.totalPages);
      const params = new URLSearchParams(searchParams.toString());
      if (newPage === 1) {
        params.delete("page");
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

  return (
    <div className="md:mt-0 mt-5 flex w-full flex-col gap-y-6">
      <SiteBreadcrumb items={[{ label: "Category" }]} className="mb-0" />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-row items-center justify-between">
          <m.div {...fadeUp} className="flex flex-row items-center flex-1">
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              Categories
            </h2>
            <m.div
              {...expandXOnView}
              className="mt-1 ml-4 h-[2px] flex-1 origin-left bg-gradient-to-r from-[var(--foreground)]/20 to-transparent"
            />
          </m.div>
        </div>

        {/* Subtitle and Controls */}
        <m.div
          {...fadeUp}
          className="flex w-full flex-col items-start md:items-center justify-between gap-8 md:gap-5 border-b border-muted-foreground/20 pb-5 md:flex-row"
        >
          <p className="text-muted-foreground max-w-md text-sm">
            Deconstruct topics by category to extract specific technical wisdom.
          </p>
          <div className="pb-4 -mt-2 flex flex-row justify-between gap-5">
            <div>
              <Select
                value={sortBy}
                onValueChange={handleSortChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 w-fit min-w-[120px] text-xs font-mono">
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
                    <SelectLabel>Post Count</SelectLabel>
                    <SelectItem value="readTimeHL">Highest</SelectItem>
                    <SelectItem value="readTimeLH">Lowest</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v as "grid" | "list")}
                className="border border-[var(--border)] rounded-lg bg-background"
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
      </div>

      {/* Grid / List */}
      <m.div
        layout
        className={cn(
          "grid gap-4 transition-opacity duration-300",
          isLoading ? "opacity-50 pointer-events-none" : "opacity-100",
          view === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1",
        )}
      >
        <AnimatePresence mode="popLayout">
          {sortedItems.map((cat) => (
            <m.div
              key={cat.id}
              layout="position"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
            >
              <CategoryCard category={cat} variant={view} />
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>

      {/* Pagination Wrapper */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 pb-12 relative">
          {isLoading && (
            <div className="absolute flex items-center gap-2 text-muted-foreground bg-background/80 px-4 py-2 rounded-full shadow-sm z-10 -top-4">
              <IconLoader2 className="animate-spin" size={18} />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          )}
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

export default function CategoriesSection(props: CategoriesSectionProps) {
  return (
    <Suspense fallback={<LoadingCategories />}>
      <CategoriesSectionContent {...props} />
    </Suspense>
  );
}
