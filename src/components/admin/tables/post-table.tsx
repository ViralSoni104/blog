"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  bulkDeletePosts,
  bulkTogglePostStatus,
  deletePost,
} from "@/actions/(admin)/post-action";
import { PostWithRelations } from "@/schemas";

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
import {
  IconTrash,
  IconEye,
  IconLoader2,
  IconAlertTriangle,
  IconCircleDashed,
  IconEyeOff,
  IconCircleCheck,
} from "@tabler/icons-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";
interface Props {
  posts: PostWithRelations[];
  currentPage: number;
  totalPages: number;
  search: string;
}

function PostTableContent({ posts, currentPage, totalPages, search }: Props) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultSearch = search;
  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  /* ---------------- SEARCH DEBOUNCE ---------------- */
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? posts.map((p) => p.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id),
    );
  };

  const onBulkDelete = () => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      const res = await bulkDeletePosts(selectedIds);
      if (res.success) {
        toast.success("Posts deleted successfully", { position: "top-right" });
        setSelectedIds([]);
        setOpen(false);
      } else {
        toast.error(res.error, { position: "top-right" });
      }
    });
  };

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (searchValue === currentSearch) return;

    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }

      params.set("page", "1");
      nav.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(delay);
  }, [searchValue, nav, searchParams]);

  /* ---------------- DELETE ---------------- */
  const handleStatusToggle = (publish: boolean) => {
    startTransition(async () => {
      const result = await bulkTogglePostStatus(selectedIds, publish);
      if (result.success) {
        toast.success(
          `Successfully ${publish ? "published" : "drafted"} ${selectedIds.length} posts`,
          { position: "top-right" },
        );
        setSelectedIds([]);
      } else {
        toast.error("Failed to update post status", { position: "top-right" });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deletePost(id);

      if (res.success) toast.success(res.message, { position: "top-right" });
      else toast.error(res.message, { position: "top-right" });
    });
  };

  const selectedPosts = posts.filter((p) => selectedIds.includes(p.id));

  // Are ALL selected posts already published?
  const allSelectedArePublished =
    selectedPosts.length > 0 && selectedPosts.every((p) => p.published);

  // Are ALL selected posts already drafts?
  const allSelectedAreDrafts =
    selectedPosts.length > 0 && selectedPosts.every((p) => !p.published);

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Posts</h2>

        <div className="flex gap-2 md:flex-row flex-col">
          <Input
            placeholder="Search posts..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="md:w-64 w-full"
          />

          <Link href="/admin/posts/new">
            <Button className="w-full md:w-auto">Create Post</Button>
          </Link>
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex md:items-center gap-2 animate-in fade-in slide-in-from-left-2 md:flex-row flex-col">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="animate-in fade-in slide-in-from-left-2"
              >
                <IconTrash className="size-4 mr-2" />
                Delete {selectedIds.length} Posts
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="text-destructive size-5" />
                  Confirm Deletion
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete{" "}
                  <span className="font-extrabold mx-1 text-red-500">
                    * {selectedIds.length} *
                  </span>{" "}
                  posts? This will permanently remove the content, comments, and
                  analytics data associated with these posts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    onBulkDelete();
                  }}
                  className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
                  disabled={isPending}
                >
                  {isPending ? (
                    <IconLoader2 className="animate-spin size-4" />
                  ) : (
                    "Permanently Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={allSelectedArePublished || isPending}
                className="border-primary/50 text-primary hover:bg-primary/5"
              >
                <IconEye className="size-4 mr-2" /> Publish (
                {allSelectedArePublished
                  ? "Already Published"
                  : `Publish (${selectedIds.length})`}
                )
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-primary">
                  <IconCircleCheck className="size-5" />
                  Make Posts Public?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will set <strong>{selectedIds.length}</strong> posts to
                  Published. They will immediately become visible to all readers
                  on the public site.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusToggle(true)}
                  className="rounded-xl bg-primary hover:bg-primary/90"
                >
                  {isPending ? (
                    <IconLoader2 className="animate-spin" />
                  ) : (
                    "Confirm Publish"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 💡 Bulk Unpublish (Draft) Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={allSelectedAreDrafts || isPending}
              >
                <IconEyeOff className="size-4 mr-2" />
                {allSelectedAreDrafts ? "Already Drafts" : "Draft"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <IconCircleDashed className="size-5" />
                  Revert to Draft?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will hide <strong>{selectedIds.length}</strong> posts
                  from the public site. You can still edit them in the admin
                  panel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleStatusToggle(false)}
                  className="rounded-xl"
                >
                  Confirm Draft
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          Select posts to manage in bulk
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
                    selectedIds.length === posts.length && posts.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[160px] font-bold">Image</TableHead>
              <TableHead className="font-bold">Article Details</TableHead>
              <TableHead className="text-center font-bold">Views</TableHead>
              <TableHead className="text-center font-bold w-[120px]">
                Status
              </TableHead>
              <TableHead className="text-right font-bold w-[120px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-muted-foreground font-mono text-sm"
                >
                  No posts found.
                </TableCell>
              </TableRow>
            )}

            {posts.map((post) => (
              <TableRow
                key={post.id}
                className="border-y border-muted-foreground/30 hover:bg-muted/10 transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(post.id)}
                    onCheckedChange={(val) => handleSelectOne(post.id, !!val)}
                  />
                </TableCell>
                {/* 1. Image Column */}
                <TableCell className="align-top">
                  {post.image ? (
                    // 💡 FIX: Parent must be `relative` and have dimensions when child Image uses `fill`
                    <div className="relative w-32 aspect-video rounded-md overflow-hidden border border-border/50 shrink-0">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <div className="w-32 aspect-video rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground border border-border/50 shrink-0">
                      No image
                    </div>
                  )}
                </TableCell>

                {/* 2. Details Column (Title, Excerpt, Categories, Stats) */}
                <TableCell className="align-top">
                  <div className="flex flex-col gap-1.5 max-w-xl">
                    <span className="font-semibold text-base text-foreground line-clamp-1">
                      {post.title}
                    </span>
                    <span className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </span>

                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {post.categories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          className="text-[10px] px-2 py-0 uppercase tracking-wider font-bold bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {/* Stats moved here */}
                  <div className="flex items-center gap-4 mt-2 text-xs font-mono text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <IconEye size={14} className="text-primary/70" />
                      {post.viewCount || 0} Views
                    </div>
                  </div>
                </TableCell>
                {/* 3. Status Column */}
                <TableCell className="text-center align-middle">
                  <Badge variant={post.published ? "default" : "outline"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>

                {/* 4. Actions Column */}
                <TableCell className="align-middle">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/posts/${post.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                      >
                        Edit
                      </Button>
                    </Link>

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
                        <AlertDialogHeader className="flex flex-col justify-start items-start">
                          <AlertDialogTitle>
                            Permanently delete post?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-pretty text-start font-medium max-w-xs text-muted-foreground">
                            This action will permanently remove
                            <span className="font-bold text-foreground mx-1 italic">
                              {post.title}
                            </span>
                            from the database. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter className="!bg-background pt-4">
                          <div className="flex flex-row gap-2 justify-between w-full">
                            <AlertDialogCancel className="rounded-xl">
                              Cancel
                            </AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() => handleDelete(post.id)}
                              className="!bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                            >
                              {isPending ? "Processing..." : "Delete Post"}
                            </AlertDialogAction>
                          </div>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground font-mono">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`?page=${currentPage - 1}&search=${search}`}>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Previous
                </Button>
              </Link>
            )}

            {currentPage < totalPages && (
              <Link href={`?page=${currentPage + 1}&search=${search}`}>
                <Button variant="outline" size="sm" className="rounded-xl">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default function PostTable(props: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <PostTableContent {...props} />
    </Suspense>
  );
}
