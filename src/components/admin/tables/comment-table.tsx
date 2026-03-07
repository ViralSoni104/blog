"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  bulkDeleteComments,
  bulkResolveReports,
  deleteComment,
} from "@/actions/(admin)/comment-action";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconTrash,
  IconCheck,
  IconLoader2,
  IconAlertOctagon,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { CommentWithRelations } from "@/data/comment";
import Loading from "@/components/ui/loading";

interface Props {
  comments: CommentWithRelations[];
  totalPages: number;
  currentPage: number;
  search: string;
  filter: string;
}

function CommentTableContent({
  comments,
  totalPages,
  currentPage,
  search,
  filter,
}: Props) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultSearch = search;
  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDelete, setOpenDelete] = useState(false);

  const selectedComments = comments.filter((c) => selectedIds.includes(c.id));
  const noneAreReported = selectedComments.every((c) => c._count.reports === 0);

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) params.set("search", searchValue);
      else params.delete("search");
      params.set("page", "1");
      nav.push(`?${params.toString()}`, { scroll: false });
    }, 500);
    return () => clearTimeout(delay);
  }, [searchValue, nav, searchParams]);

  /* ---------------- ACTIONS ---------------- */
  const handleBulkAction = (type: "delete" | "resolve") => {
    startTransition(async () => {
      const res =
        type === "delete"
          ? await bulkDeleteComments(selectedIds)
          : await bulkResolveReports(selectedIds);

      if (res.success) {
        toast.success(
          `Successfully ${type === "delete" ? "deleted" : "resolved"} comments`,
          {
            position: "top-right",
          },
        );
        setSelectedIds([]);
        setOpenDelete(false);
      } else {
        toast.error("Operation failed", { position: "top-right" });
      }
    });
  };

  const handleSingleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteComment(id);
      if (res.success)
        toast.success("Comment deleted", { position: "top-right" });
      else toast.error("Failed to delete", { position: "top-right" });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex bg-muted p-1 rounded-xl border border-muted-foreground/20 w-fit">
          <Button
            variant={"ghost"}
            size="sm"
            className={
              filter === "reported"
                ? "rounded-lg px-4 border border-muted-foreground/20 bg-background text-foreground hover:bg-background"
                : "rounded-lg px-4"
            }
            onClick={() => nav.push("?filter=reported")}
          >
            <IconAlertOctagon size={16} className="mr-2 text-destructive" />
            Reported
          </Button>
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            className={
              filter === "all"
                ? "rounded-lg px-4 border border-muted-foreground/20 bg-background text-foreground hover:bg-background"
                : "rounded-lg px-4 "
            }
            onClick={() => nav.push("?filter=all")}
          >
            All Comments
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Input
              placeholder="Search comments..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedIds.length > 0 ? (
        <div className="flex md:items-center gap-2 animate-in fade-in slide-in-from-left-2 md:flex-row flex-col">
          <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="rounded-xl">
                <IconTrash className="size-4 mr-2" />
                Delete {selectedIds.length}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="text-destructive size-5" />{" "}
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-red-500">
                    {selectedIds.length}
                  </span>{" "}
                  comments?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleBulkAction("delete")}
                  className="bg-destructive hover:bg-destructive/90 rounded-xl"
                >
                  {isPending ? (
                    <IconLoader2 className="animate-spin" />
                  ) : (
                    "Permanently Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={noneAreReported || isPending}
            onClick={() => handleBulkAction("resolve")}
          >
            <IconCheck className="mr-2 size-4 text-emerald-500" /> Dismiss
            Reports
          </Button>
        </div>
      ) : (
        <div className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          Select comments to manage in bulk
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-background border-muted-foreground/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-muted-foreground/30 bg-muted">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    selectedIds.length === comments.length &&
                    comments.length > 0
                  }
                  onCheckedChange={(checked) =>
                    setSelectedIds(checked ? comments.map((c) => c.id) : [])
                  }
                />
              </TableHead>
              <TableHead className="font-bold">User</TableHead>
              <TableHead className="font-bold w-[40%]">Comment</TableHead>
              <TableHead className="font-bold">Post</TableHead>
              <TableHead className="text-center font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {comments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground font-mono text-sm"
                >
                  No comments found.
                </TableCell>
              </TableRow>
            ) : (
              comments.map((comment) => (
                <TableRow
                  key={comment.id}
                  className="border-y border-muted-foreground/30 hover:bg-muted/10 transition-colors"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(comment.id)}
                      onCheckedChange={(checked) =>
                        setSelectedIds((prev) =>
                          checked
                            ? [...prev, comment.id]
                            : prev.filter((id) => id !== comment.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {comment.user?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {comment.user?.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm leading-relaxed line-clamp-2">
                      {comment.content}
                    </p>
                    <time className="text-[10px] uppercase font-mono text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </time>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-blue-500 hover:underline cursor-pointer truncate max-w-[150px]">
                      {comment.post?.title}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {comment._count.reports > 0 ? (
                      <Badge
                        variant="destructive"
                        className="rounded-md font-bold"
                      >
                        {comment._count.reports} Reports
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-md opacity-60 font-normal"
                      >
                        Clean
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isPending}
                          className="rounded-xl h-8 w-8 p-0"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-fit pb-0 rounded-2xl">
                        <AlertDialogHeader className="items-start">
                          <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                          <AlertDialogDescription className="max-w-xs text-start">
                            This will permanently remove this comment.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="!bg-background pt-4">
                          <div className="flex gap-2 justify-between w-full">
                            <AlertDialogCancel className="rounded-xl">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleSingleDelete(comment.id)}
                              className="bg-destructive hover:bg-destructive/90 rounded-xl"
                            >
                              Delete
                            </AlertDialogAction>
                          </div>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground font-mono">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={currentPage <= 1}
            onClick={() =>
              nav.push(
                `?page=${currentPage - 1}&filter=${filter}&search=${search}`,
              )
            }
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={currentPage >= totalPages}
            onClick={() =>
              nav.push(
                `?page=${currentPage + 1}&filter=${filter}&search=${search}`,
              )
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CommentTable(props: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <CommentTableContent {...props} />
    </Suspense>
  );
}
