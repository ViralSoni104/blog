"use client";

import { useState, useEffect } from "react";
import {
  IconMessageCircle,
  IconShare3,
  IconBookmark,
  IconLink,
  IconBrandX,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandThreads,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  incrementShareCount,
  toggleLike,
  toggleBookmark,
} from "@/actions/engagement-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { premiumToast } from "@/components/ui/premium-toast";
import { AnimatedLikeButton } from "@/components/ui/like-button";
import { usePostHog } from "posthog-js/react";

interface EngagementBarProps {
  postId: string;
  initialLikes: number;
  initialComments: number;
  initialShares: number;
  title: string;
  initialIsLiked?: boolean;
  initialIsBookmarked?: boolean;
  isLoggedIn?: boolean;
  image: string;
}

export function EngagementBar({
  postId,
  initialLikes,
  initialComments,
  initialShares,
  title,
  initialIsLiked = false,
  initialIsBookmarked = false,
  isLoggedIn = false,
  image,
}: EngagementBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [shares, setShares] = useState(initialShares);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const pathname = usePathname();
  const nav = useRouter();
  const posthog = usePostHog();
  // Check if the device supports native sharing after hydration
  useEffect(() => {
    // Wrapping in a setTimeout defers the execution to the next tick,
    // bypassing the "synchronous setState in effect" error while still safely
    // preventing SSR hydration mismatches.
    const timer = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.share) {
        setCanNativeShare(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  /* ---------------- LIKES ---------------- */
  const handleLike = async () => {
    if (!isLoggedIn) {
      nav.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const actionToTake = isLiked ? "unlike" : "like";
    const previousIsLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    const res = await toggleLike(postId, actionToTake);

    if (!res.success) {
      setIsLiked(previousIsLiked);
      setLikes((prev) => (previousIsLiked ? prev + 1 : prev - 1));
      toast.error(res.message || "Failed to update like.", {
        position: "top-center",
      });
      return;
    }
    if (actionToTake === "like") {
      posthog.capture("article_liked", {
        article_id: postId,
        article_title: title,
      });
    }
  };

  /* ---------------- BOOKMARKS ---------------- */
  const handleBookmark = async () => {
    if (!isLoggedIn) {
      nav.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    const actionToTake = isBookmarked ? "unbookmark" : "bookmark";
    const previousIsBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    const res = await toggleBookmark(postId, actionToTake);

    if (res.success) {
      if (!isBookmarked) {
        premiumToast({
          message: "Saved to bookmarks",
          image: image, // The featured image from your Prisma DB
          actionLabel: "View",
          position: "top-center",
          onAction: () => {
            window.location.href = "/bookmarks";
          },
        });
        posthog.capture("article_bookmarked", {
          article_id: postId,
          article_title: title,
          location: "article page", // Helpful if you have multiple bookmark buttons
        });
      } else
        toast.success("Removed from bookmarks", {
          position: "top-center",
        });
    } else {
      setIsBookmarked(previousIsBookmarked);
      toast.error(res.message || "Failed to update bookmark.", {
        position: "top-center",
      });
    }
  };

  /* ---------------- SHARE HANDLERS ---------------- */
  const incrementAndSetShare = async () => {
    const storageKey = `shared_post_${postId}`;
    if (localStorage.getItem(storageKey)) {
      return; // Do nothing, they already boosted the count once!
    }
    const res = await incrementShareCount(postId);
    if (res.success) {
      setShares(res.shares);
      localStorage.setItem(storageKey, "true");
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Legacy Fallback (for local network mobile testing)
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      posthog.capture("article_shared", {
        article_id: postId,
        article_title: title,
        platform: "copy_link",
      });
      toast.success("Link copied to clipboard!", { position: "top-center" });
      incrementAndSetShare();
    } catch {
      toast.error("Failed to copy link.", { position: "top-center" });
    }
  };

  const handleSocialShare = (
    platform: "x" | "linkedin" | "facebook" | "threads",
  ) => {
    const url = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title);

    let shareUrl = "";
    switch (platform) {
      case "x":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "threads":
        shareUrl = `https://threads.net/intent/post?text=${encodedTitle}%20${url}`;
        break;
    }
    posthog.capture("article_shared", {
      article_id: postId,
      article_title: title,
      platform: platform,
    });
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
    incrementAndSetShare();
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: window.location.href });
      incrementAndSetShare();
    } catch {
      // User cancelled native share, do nothing
    }
  };

  return (
    <div className="flex items-center gap-2 bg-background backdrop-blur-md border border-muted-foreground/30 md:border-border rounded-full px-4 py-2 shadow-lg w-fit mx-auto">
      {/* LIKES */}
      <AnimatedLikeButton
        onClick={handleLike}
        isLiked={isLiked}
        likes={likes}
      />

      <div className="w-px h-4 bg-muted-foreground/30 md:bg-border" />

      {/* COMMENTS */}
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full gap-2"
        onClick={() => window.dispatchEvent(new Event("open-comments"))}
      >
        <IconMessageCircle size={20} />
        <span className="font-mono text-xs">{initialComments}</span>
      </Button>

      <div className="w-px h-4 bg-muted-foreground/30 md:bg-border" />

      {/* DEV.TO STYLE SHARES MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full gap-2">
            <IconShare3 size={20} />
            <span className="font-mono text-xs">{shares}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          sideOffset={12}
          className="w-56 rounded-xl shadow-2xl pb-2"
        >
          <DropdownMenuItem
            onClick={handleCopyLink}
            className="gap-3 py-2.5 cursor-pointer rounded-lg mx-1 mt-1"
          >
            <IconLink size={18} className="text-muted-foreground" />
            <span className="font-medium">Copy link</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 mx-2" />

          <DropdownMenuItem
            onClick={() => handleSocialShare("x")}
            className="gap-3 py-2.5 cursor-pointer rounded-lg mx-1"
          >
            <IconBrandX size={18} className="text-muted-foreground" />
            <span className="font-medium">Share to X</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSocialShare("linkedin")}
            className="gap-3 py-2.5 cursor-pointer rounded-lg mx-1"
          >
            <IconBrandLinkedin size={18} className="text-blue-600" />
            <span className="font-medium">Share to LinkedIn</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSocialShare("facebook")}
            className="gap-3 py-2.5 cursor-pointer rounded-lg mx-1"
          >
            <IconBrandFacebook size={18} className="text-blue-500" />
            <span className="font-medium">Share to Facebook</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSocialShare("threads")}
            className="gap-3 py-2.5 cursor-pointer rounded-lg mx-1"
          >
            <IconBrandThreads size={18} className="text-foreground" />
            <span className="font-medium">Share to Threads</span>
          </DropdownMenuItem>

          {/* Only show "Share via..." if the user's browser/OS supports it (Mobile/Mac) */}
          {canNativeShare && (
            <>
              <DropdownMenuSeparator className="my-1 mx-2" />
              <DropdownMenuItem
                onClick={handleNativeShare}
                className="gap-3 py-2.5 cursor-pointer rounded-lg mx-1"
              >
                <IconShare3 size={18} className="text-muted-foreground" />
                <span className="font-medium">Share via...</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="w-px h-4 bg-muted-foreground/30 md:bg-border" />

      {/* BOOKMARKS */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        className={cn(
          "rounded-full transition-colors duration-300",
          isBookmarked && "text-primary bg-primary/10 hover:bg-primary/20",
        )}
      >
        <IconBookmark
          size={20}
          className={cn(isBookmarked && "fill-current")}
        />
      </Button>
    </div>
  );
}
