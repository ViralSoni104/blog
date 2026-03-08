"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { IconSearch, IconArticle, IconFolder } from "@tabler/icons-react";
import { globalSearch, type SearchResult } from "@/actions/search-action";
import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePostHog } from "posthog-js/react";

export function SearchMenu() {
  const nav = useRouter();
  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    posts: [],
    categories: [],
  });
  const [isPending, startTransition] = useTransition();
  const posthog = usePostHog();

  // 💡 The Secret Weapon: Client-side In-Memory Cache
  const searchCache = useRef<Map<string, SearchResult>>(new Map());

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 2) {
      const clearTimer = setTimeout(() => {
        setResults({ posts: [], categories: [] });
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    // 💡 Instant display if we already searched this exact term!
    if (searchCache.current.has(normalizedQuery)) {
      setResults(searchCache.current.get(normalizedQuery)!);
      return; // Skip the network request entirely
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearch(normalizedQuery);
        // Save the result to our cache for instant backspacing later
        searchCache.current.set(normalizedQuery, data);
        setResults(data);
        posthog.capture("search_executed", {
          query: normalizedQuery,
          source: "command_palette",
          result_count: data.posts.length + data.categories.length,
        });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, posthog]);

  const handleSelect = (path: string) => {
    posthog.capture("search_result_clicked", {
      query: query.trim().toLowerCase(),
      destination_path: path,
      source: "command_palette",
    });

    setOpen(false);
    nav.push(path);
    setTimeout(() => {
      setQuery("");
      setResults({ posts: [], categories: [] });
    }, 200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="focus-visible:ring-ring bg-secondary relative h-auto items-center justify-center gap-2 rounded-md p-2 text-sm font-medium shadow-none focus-visible:ring-2 focus-visible:outline-none md:inline-flex dark:ring-1 transition-colors hover:bg-secondary/80"
        aria-label="Open search menu"
      >
        <IconSearch className="size-4.5" strokeWidth={2} />
      </button>

      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogContent className="overflow-hidden border-4 border-[var(--secondary)] p-0 shadow-lg sm:max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>

          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type here to search articles and categories..."
              value={query}
              onValueChange={setQuery}
            />

            <CommandList className="relative">
              {/* 💡 Subtle background loading indicator that doesn't disrupt the list */}
              {isPending && (
                <div className="absolute top-0 inset-x-0 h-0.5 bg-muted overflow-hidden z-10 opacity-50">
                  <div className="h-full bg-primary animate-pulse w-1/3 rounded-full" />
                </div>
              )}

              <AnimatePresence mode="wait">
                {!isPending &&
                  query.length >= 2 &&
                  results.posts.length === 0 &&
                  results.categories.length === 0 && (
                    <m.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CommandEmpty className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                        <IconSearch className="size-10 mb-2 opacity-20" />
                        <p>No results found for &quot;{query}&quot;.</p>
                      </CommandEmpty>
                    </m.div>
                  )}

                {query.length < 2 && (
                  <m.div
                    key="prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Type at least 2 characters to search...
                  </m.div>
                )}

                {(results.categories.length > 0 ||
                  results.posts.length > 0) && (
                  <m.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {results.categories.length > 0 && (
                      <CommandGroup heading="Categories">
                        {results.categories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={`category-${category.slug}`}
                            onSelect={() =>
                              handleSelect(`/category/${category.slug}`)
                            }
                          >
                            <IconFolder className="mr-2 size-4 text-primary/70" />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {results.categories.length > 0 &&
                      results.posts.length > 0 && <CommandSeparator />}

                    {results.posts.length > 0 && (
                      <CommandGroup heading="Articles">
                        {results.posts.map((post) => (
                          <CommandItem
                            key={post.id}
                            value={`post-${post.slug}`}
                            onSelect={() =>
                              handleSelect(`/articles/${post.slug}`)
                            }
                          >
                            <IconArticle className="mr-2 size-4 text-primary/70" />
                            <span className="truncate">{post.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </m.div>
                )}
              </AnimatePresence>
            </CommandList>
            {(results.posts.length === 5 ||
              results.categories.length === 5) && (
              <div className="border-t border-border/40 p-1 bg-background shrink-0 z-20">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-md py-3 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  View all advanced results &rarr;
                </Link>
              </div>
            )}
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
