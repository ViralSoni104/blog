"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import Loading from "@/components/ui/loading";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  // 💡 Added optional callback for client-side override
  onPageChange?: (page: number) => void;
}

function PaginationWrapperContent({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const nav = useRouter();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page); // Use client state if provided
    } else {
      nav.push(createPageUrl(page)); // Fallback to URL-based
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={currentPage <= 1}
        onClick={() => handlePageClick(currentPage - 1)}
        className="rounded-xl border-muted-foreground/20"
      >
        <IconChevronLeft size={18} />
      </Button>

      <div className="flex items-center gap-1 mx-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isAdjacent = Math.abs(page - currentPage) <= 1;
          const isEdge = page === 1 || page === totalPages;

          if (!isAdjacent && !isEdge) {
            if (page === 2 || page === totalPages - 1) {
              return (
                <span key={page} className="px-1 text-muted-foreground text-xs">
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              onClick={() => handlePageClick(page)}
              className={cn(
                "h-9 w-9 rounded-xl font-bold transition-all",
                currentPage === page
                  ? "shadow-md shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        className="rounded-xl border-muted-foreground/20"
      >
        <IconChevronRight size={18} />
      </Button>
    </div>
  );
}

export function PaginationWrapper(props: PaginationProps) {
  return (
    <Suspense fallback={<Loading />}>
      <PaginationWrapperContent {...props} />
    </Suspense>
  );
}
