"use client";

import Link from "next/link";
import { m, type MotionProps } from "framer-motion";
import {
  IconBookmarkFilled,
  IconBookmarkPlus,
  IconChevronsRight,
  IconHourglassEmpty,
} from "@tabler/icons-react";
import { cn, getBlurPlaceholder, getRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "./border-beam";
import { PublicPost } from "@/actions/post-action";
import Image from "next/image";
import { toggleBookmark } from "@/actions/engagement-actions";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { premiumToast } from "@/components/ui/premium-toast";
import { usePostHog } from "posthog-js/react";
import { useSession } from "next-auth/react";

export type ArticleCardVariant = "grid" | "list";

interface ArticleCardProps {
  article: Partial<PublicPost> & { isBookmarked?: boolean };
  variant?: ArticleCardVariant;
  motionProps?: MotionProps;
  id?: string;
}

export function ArticleCard({
  article,
  variant = "grid",
  motionProps,
  id,
}: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked);
  const [isPending, startTransition] = useTransition();
  const posthog = usePostHog();
  const nav = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      nav.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const nextStatus = !isBookmarked;
    setIsBookmarked(nextStatus); // Local Optimistic Update

    startTransition(async () => {
      const action = nextStatus ? "bookmark" : "unbookmark";
      const result = await toggleBookmark(article.id, action);

      if (result.success) {
        window.dispatchEvent(
          new CustomEvent("article-bookmark-update", {
            detail: { id: article.id, status: nextStatus },
          }),
        );

        if (!isBookmarked) {
          premiumToast({
            message: "Saved to bookmarks",
            image: article.image,
            actionLabel: "View",
            position: "top-center",
            onAction: () => {
              window.location.href = "/bookmarks";
            },
          });
          posthog.capture("article_bookmarked", {
            article_id: article.id,
            article_title: article.title,
            location: "article card",
          });
        } else {
          toast.success("Removed from bookmarks", {
            position: "top-center",
          });
        }
        nav.refresh();
      } else {
        setIsBookmarked(!nextStatus); // Revert on fail
        toast.error("Please login to manage bookmarks", {
          position: "top-center",
        });
      }
    });
  };

  useEffect(() => {
    const handleGlobalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.id === article.id) {
        setIsBookmarked(customEvent.detail.status);
      }
    };

    window.addEventListener("article-bookmark-update", handleGlobalUpdate);
    return () =>
      window.removeEventListener("article-bookmark-update", handleGlobalUpdate);
  }, [article.id]);

  const formattedDate = article.createdAt
    ? getRelativeTime(new Date(article.createdAt))
    : "just now";

  return (
    <m.article
      {...motionProps}
      id={id}
      className={cn(
        "group scroll-mt-24 relative flex overflow-hidden transition-all duration-300 ease-out",
        "bg-card border border-muted-foreground/20 hover:border-primary/30",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5",
        "rounded-2xl md:rounded-3xl",
        variant === "grid" ? "flex-col" : "flex-col md:flex-row gap-2 md:gap-4",
      )}
    >
      <BorderBeam
        size={150}
        duration={6}
        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted/30",
          variant === "grid"
            ? "aspect-[16/10] w-full border-b border-border/10"
            : "aspect-video w-full md:aspect-auto md:w-2/5 border-b md:border-b-0 md:border-r border-border/10",
        )}
      >
        <Image
          src={article.image || "/placeholder-image.jpg"}
          alt={article.title || "Article Image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          blurDataURL={getBlurPlaceholder(article.image)}
        />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col",
          variant === "grid"
            ? "p-4 md:p-6"
            : "py-2 pr-2 md:pl-0.5 md:pr-3 px-3",
        )}
      >
        <div className="flex items-center gap-2 mt-1 mb-3 shrink-0">
          {article.categories?.[0] && (
            <div className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold text-primary-foreground uppercase tracking-wider">
              {article.categories[0].name}
            </div>
          )}
          <span className="text-[10px] text-muted-foreground/50">•</span>
          <span className="text-[11px] font-medium text-muted-foreground tracking-tight capitalize whitespace-nowrap">
            {formattedDate}
          </span>
        </div>

        <h3 className="font-bold leading-tight tracking-tight text-balance transition-colors group-hover:text-primary text-xl md:text-2xl mb-2">
          <Link
            href={`/articles/${article.slug}`}
            className="before:absolute before:inset-0 before:z-10"
          >
            {article.title}
          </Link>
        </h3>

        <p className="text-muted-foreground leading-relaxed font-sans mb-6 text-sm line-clamp-2">
          {article.excerpt}
        </p>

        {/* 💡 THE FIX: Conditionally Responsive Footer */}
        <div className="mt-auto flex flex-row items-center justify-between pt-4 border-t border-dashed border-border/60 w-full gap-2">
          <div
            className={cn(
              "flex items-center gap-2 sm:gap-4 relative z-10 shrink-0",
              variant === "grid"
                ? "justify-between w-full xl:w-auto xl:justify-start" // Grid: w-full & justify-between until 1280px
                : "justify-between w-full sm:w-auto sm:justify-start", // List: original behavior
            )}
          >
            <div className="bg-muted/30 text-muted-foreground inline-flex items-center gap-1 rounded p-1 sm:px-2 text-[11px] sm:text-xs font-medium outline outline-[var(--border)]/30 shrink-0 whitespace-nowrap">
              <IconHourglassEmpty size={14} className="text-primary shrink-0" />
              <span>{article.readingTime}m Read</span>
            </div>

            <Button
              className="text-muted-foreground hover:bg-transparent cursor-pointer transition-colors h-8 w-8 px-0 shrink-0"
              variant="ghost"
              disabled={isPending}
              onClick={handleBookmark}
            >
              {isBookmarked ? (
                <IconBookmarkFilled size={18} className="text-primary" />
              ) : (
                <IconBookmarkPlus size={18} />
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "group/btn relative z-10 h-8 px-0 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-primary hover:bg-transparent pointer-events-none shrink-0",
              variant === "grid"
                ? "hidden xl:flex" // Grid: Hide Read More until 1280px
                : "hidden sm:flex", // List: Hide Read More only on mobile
            )}
          >
            Read More
            <IconChevronsRight
              size={16}
              className="ml-0 transition-transform group-hover/btn:translate-x-0.5 shrink-0"
            />
          </Button>
        </div>
      </div>
    </m.article>
  );
}
