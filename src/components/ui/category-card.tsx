"use client";

import Link from "next/link";
import { IconArticle, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoryWithCount } from "@/schemas"; // Or your correct types path

interface CategoryCardProps {
  category: CategoryWithCount;
  variant?: "grid" | "list";
}

export default function CategoryCard({
  category,
  variant = "grid",
}: CategoryCardProps) {
  return (
    <Link href={`/category/${category.slug}`} className="block h-full">
      <article
        className={cn(
          "group bg-card hover:bg-muted/20 relative flex flex-col justify-between rounded-xl border border-[var(--border)] transition-all duration-300",
          variant === "grid" ? "p-5 h-full" : "p-4 md:p-5",
        )}
      >
        {/* Blueprint Corner Detail */}
        <div className="absolute top-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="h-3 w-3 border-t border-r border-[var(--primary)]" />
        </div>

        {/* --- MOBILE LIST VIEW (2 Rows Only) --- */}
        <div
          className={cn(
            "flex flex-col gap-3 md:hidden",
            variant === "list" ? "flex" : "hidden",
          )}
        >
          {/* Row 1: Title Only */}
          <div className="flex items-center">
            <h3 className="text-base font-bold tracking-tight">
              {category.name}
            </h3>
          </div>

          {/* Row 2: Total + CTA */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-[var(--border)]/50">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <IconArticle size={14} /> {category._count?.posts || 0} Articles
            </span>
            <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)] transition-transform group-hover:translate-x-1">
              Explore <IconChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* --- DESKTOP & GRID VIEW (Full Layout) --- */}
        <div
          className={cn(
            "flex-col h-full",
            variant === "list" ? "hidden md:flex" : "flex",
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-md font-bold transition-colors group-hover:text-[var(--primary)]">
              {category.name}
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-7 border-[var(--border)] text-xs font-bold tracking-tight transition-all group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]"
            >
              Explore
            </Button>
          </div>

          <p
            className={cn(
              "text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed",
              category.description ? "flex" : "hidden",
            )}
          >
            {category.description || "No description provided."}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-[var(--border)]/50 pt-4">
            <span className="text-muted-foreground inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
              <IconArticle size={16} strokeWidth={1.25} />{" "}
              {category._count?.posts || 0} Articles
            </span>
            <div className="bg-muted h-1 w-16 overflow-hidden rounded-full">
              <div className="h-full w-2/3 bg-[var(--primary)] opacity-40 transition-transform group-hover:translate-x-full duration-1000" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
