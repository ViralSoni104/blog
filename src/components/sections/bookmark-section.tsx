"use client";

import React, { useState, useEffect, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  IconArrowsSort,
  IconLayoutGrid,
  IconList,
  IconLoader2,
} from "@tabler/icons-react";
import { ArticleCard } from "@/components/ui/article-card";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { getBookmarkedPosts, type BookmarkWithPost } from "@/data/bookmarks";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { expandXOnView, fadeUp } from "@/lib/motion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

interface BookmarksSectionProps {
  initialBookmarks: BookmarkWithPost[];
  initialTotalPages: number;
  currentPage?: number;
  userId: string;
}

export default function BookmarksSection({
  initialBookmarks,
  initialTotalPages,
  currentPage = 1,
  userId,
}: BookmarksSectionProps) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");

  const [items, setItems] = useState<BookmarkWithPost[]>(initialBookmarks);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setItems(initialBookmarks);
    setPage(currentPage);
    setTotalPages(initialTotalPages);
  }, [initialBookmarks, initialTotalPages, currentPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // Sorting by bookmark date (a.createdAt) and reading time from the post content
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      // 💡 Use the pre-calculated DB property instead of parsing missing HTML
      const readTimeA = a.post.readingTime || 1;
      const readTimeB = b.post.readingTime || 1;

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

  const handlePageChange = async (newPage: number) => {
    if (isLoading || newPage === page) return;

    setIsLoading(true);
    try {
      const res = await getBookmarkedPosts(userId, newPage);
      setItems(res.bookmarks as BookmarkWithPost[]);
      setPage(newPage);
      setTotalPages(res.totalPages);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-24 text-center border-2 border-dashed border-muted rounded-[2rem]">
        <h2 className="text-xl font-bold">Your library is empty</h2>
        <p className="text-muted-foreground mt-2 italic font-medium">
          Save articles to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4">
        {/* Title and Animated Line */}
        <div className="flex w-full flex-row items-center justify-between">
          <m.div {...fadeUp} className="flex flex-row items-center flex-1">
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              Bookmarks
            </h2>
            <m.div
              {...expandXOnView}
              className="mt-1 ml-4 h-[2px] flex-1 origin-left bg-gradient-to-r from-[var(--foreground)]/20 to-transparent"
            />
          </m.div>
        </div>

        {/* Subtitle / Description */}
        <m.div
          {...fadeUp}
          className="flex w-full flex-col items-start md:items-center justify-between gap-4 md:gap-5 border-b border-muted-foreground/20 pb-5 md:flex-row"
        >
          <p className="text-muted-foreground max-w-md text-sm">
            Your private collection of technical wisdom and saved articles.
          </p>
          <div className="flex w-full md:justify-end gap-4">
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-full max-w-[150px] text-xs font-mono hover:bg-muted/50 transition-colors">
                  <IconArrowsSort className="size-3.5 opacity-70" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs">
                  <SelectGroup>
                    <SelectLabel>Date Added</SelectLabel>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Reading Time</SelectLabel>
                    <SelectItem value="readTimeHL">Longest</SelectItem>
                    <SelectItem value="readTimeLH">Quickest</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v as "grid" | "list")}
                className="hidden md:flex border border-[var(--border)] rounded-lg bg-background"
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
      <m.div
        layout
        className={cn(
          "grid gap-8 transition-opacity duration-300",
          isLoading ? "opacity-50 pointer-events-none" : "opacity-100",
          view === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1",
        )}
      >
        <AnimatePresence mode="popLayout">
          {sortedItems.map((b, index) => (
            <m.div
              key={b.id}
              layout="position"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <ArticleCard
                article={{
                  ...b.post,
                  isBookmarked: true,
                }}
                variant={view}
              />
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>

      {totalPages > 1 && (
        <div className="flex justify-center border-t border-muted pt-8 relative">
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
