"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  bulkDeleteCategories,
  deleteCategory,
} from "@/actions/(admin)/category-actions";
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
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { posts: number };
}

interface Props {
  categories: Category[];
  currentPage: number;
  totalPages: number;
  search: string;
}

function CategoryTableContent({
  categories,
  currentPage,
  totalPages,
  search,
}: Props) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const defaultSearch = search;
  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [open, setOpen] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === categories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(categories.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const result = await bulkDeleteCategories(selectedIds);
      if (result.success) {
        toast.success(`Deleted ${selectedIds.length} categories`, {
          position: "top-right",
        });
        setSelectedIds([]); // Reset selection
        setOpen(false);
      } else {
        toast.error("Something went wrong", { position: "top-right" });
      }
    });
  };

  // 🔎 Debounce search
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

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success === true)
        toast.success(res.message, { position: "top-right" });
      else toast.error(res.message, { position: "top-right" });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="flex gap-2 md:flex-row flex-col">
          <Input
            placeholder="Search category..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="md:w-64 w-full"
          />

          <Link href="/admin/categories/new">
            <Button className="w-full md:w-auto">Add New</Button>
          </Link>
        </div>
      </div>
      {selectedIds.length > 0 ? (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              disabled={isPending || selectedIds.length === 0}
            >
              {isPending ? (
                <IconLoader2 className="animate-spin size-4 mr-2" />
              ) : (
                <IconTrash className="size-4 mr-2" />
              )}
              Delete ({selectedIds.length})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to delete{" "}
                <span className="font-extrabold mx-1 text-red-500">
                  * {selectedIds.length} *
                </span>{" "}
                categories. This action cannot be undone and will remove all
                associations with existing posts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault(); // Keep modal open during transition
                  handleBulkDelete();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                disabled={isPending || selectedIds.length === 0}
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete All"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <div className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-muted-foreground" />
          Select categories to manage in bulk
        </div>
      )}
      {/* Table */}
      <div className="rounded-md border bg-background border-muted-foreground/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-muted-foreground/30 bg-muted rounded-md">
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    selectedIds.length === categories.length &&
                    categories.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Slug</TableHead>
              <TableHead className="text-center font-bold">Posts</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            )}

            {categories.map((cat) => (
              <TableRow
                key={cat.id}
                className="border-y border-muted-foreground/30"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(cat.id)}
                    onCheckedChange={() => toggleSelectOne(cat.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {cat.slug}
                </TableCell>
                <TableCell className="text-center">
                  {cat._count.posts}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Link href={`/admin/categories/${cat.id}`}>
                    <Button size="sm" variant="outline">
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
                          Permanently delete category?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-pretty text-start font-medium max-w-xs text-muted-foreground">
                          This action will remove the category
                          <span className="font-bold text-foreground mx-1 italic">
                            {cat.name}
                          </span>
                          from the database. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="!bg-background">
                        <div className="flex flex-row gap-2 justify-between w-full">
                          <AlertDialogCancel className="rounded-xl">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat.id)}
                            className="!bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                          >
                            {isPending ? "Processing..." : "Delete Category"}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex gap-2">
          {currentPage > 1 && (
            <Link href={`?page=${currentPage - 1}&search=${search}`}>
              <Button variant="outline" size="sm">
                Previous
              </Button>
            </Link>
          )}

          {currentPage < totalPages && (
            <Link href={`?page=${currentPage + 1}&search=${search}`}>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryTable(props: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <CategoryTableContent {...props} />
    </Suspense>
  );
}
