"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  deleteUser,
  bulkDeleteUsers,
  bulkToggleUserVerification,
  cleanupPendingUsers,
} from "@/actions/(admin)/user-action";
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
import {
  IconUsers,
  IconTrash,
  IconBrandGoogle,
  IconMail,
  IconX,
  IconBrandGithub,
  IconGhost,
  IconUserCheck,
  IconUserOff,
  IconLoader2,
} from "@tabler/icons-react";
import { SiteBreadcrumb } from "../../ui/breadcrumb";
import { UserWithAccounts } from "@/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";
interface Props {
  users: UserWithAccounts[];
  currentPage: number;
  totalPages: number;
  search: string;
}

function UserTableContent({ users, currentPage, totalPages, search }: Props) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultSearch = search;
  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selection Logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(users.map((u) => u.id));
    else setSelectedIds([]);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id),
    );
  };

  const isAllSelected = users.length > 0 && selectedIds.length === users.length;

  const handleSearch = (value: string) => setSearchValue(value);

  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (searchValue === currentSearch) return;

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) params.set("search", searchValue);
      else params.delete("search");
      params.set("page", "1");
      nav.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, nav, searchParams]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res.success) toast.success(res.message, { position: "top-right" });
      else toast.error(res.message, { position: "top-right" });
    });
  };

  const handleCleanup = () => {
    startTransition(async () => {
      const res = await cleanupPendingUsers();
      if (res.success) {
        toast.success(`Removed ${res.count} long time unverified users`, {
          position: "top-right",
        });
      } else {
        toast.error("Cleanup failed", { position: "top-right" });
      }
    });
  };

  const handleBulkAction = (type: "delete" | "verify" | "unverify") => {
    startTransition(async () => {
      let result;
      if (type === "delete") {
        result = await bulkDeleteUsers(selectedIds);
      } else {
        result = await bulkToggleUserVerification(
          selectedIds,
          type === "verify",
        );
      }

      if (result.success) {
        toast.success(result.message || "Action completed", {
          position: "top-right",
        });
        setSelectedIds([]);
      } else {
        toast.error("Operation failed", { position: "top-right" });
      }
    });
  };
  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  // 2. Logic for "Verify" button (show if any selected user is currently NOT verified)
  const hasUnverifiedSelected = selectedUsers.some((u) => !u.emailVerified);

  // 3. Logic for "Unverify" button (show if any selected user IS currently verified)
  const hasVerifiedSelected = selectedUsers.some((u) => u.emailVerified);
  return (
    <div className="space-y-6">
      <SiteBreadcrumb
        className="mb-2"
        items={[{ label: "Users", icon: IconUsers }]}
        isAdmin={true}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative md:w-64 w-full">
            <Input
              placeholder="Search users..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-8 rounded-xl"
            />
            {searchValue && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 "
              >
                <IconX size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {/* md:flex-row-reverse: Flips order on desktop (Cleanup moves Right, Bulk Actions move Left)
    flex-col: Stacked on mobile (Cleanup on Top, Bulk Actions Below)
*/}
      <div className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-4">
        {/* 1. CLEANUP BUTTON (Right on Desktop, Top on Mobile) */}
        <div className="flex gap-2 order-first md:order-first">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className="bg-blue-500 text-white hover:bg-blue-600 border-none rounded-md shadow-sm w-full md:w-auto"
              >
                {isPending ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconGhost size={16} className="" />
                )}
                Cleanup Ghost Subs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Cleanup Ghost Users?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all users who signed up over 6 months ago but
                  never verified their email.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCleanup}
                  className="bg-blue-600 rounded-xl"
                >
                  Run Cleanup
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* 2. BULK ACTIONS (Left on Desktop, Below Cleanup on Mobile) */}
        <div className="flex gap-2 items-center">
          {selectedIds.length > 0 ? (
            <div className="flex flex-wrap md:items-center gap-2 animate-in slide-in-from-left-2">
              {hasUnverifiedSelected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("verify")}
                  className="rounded-lg border-muted-foreground/20 w-full md:w-auto"
                >
                  <IconUserCheck className="size-4 mr-2 text-emerald-600" />
                  Verify Pending
                </Button>
              )}

              {hasVerifiedSelected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("unverify")}
                  className="rounded-lg border-muted-foreground/20 w-full md:w-auto"
                >
                  <IconUserOff className="size-4 mr-2 text-amber-600" />
                  Unverify Active
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-lg w-full md:w-auto"
                  >
                    <IconTrash className="size-4 mr-2" />
                    Delete ({selectedIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete {selectedIds.length} users?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleBulkAction("delete")}
                      className="bg-destructive rounded-xl"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              Select users to manage in bulk
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-background border-muted-foreground/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-muted-foreground/30">
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="text-center font-bold">Status</TableHead>
              <TableHead className="text-center font-bold">Provider</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-muted-foreground/30 hover:bg-muted/20 transition-colors"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(user.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(user.id, !!checked)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium py-4">
                  {user.name || "Anonymous"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-center">
                  <div
                    className={`mx-auto flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-1 px-2 rounded-full w-fit border ${user.emailVerified ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" : "text-amber-600 bg-amber-500/10 border-amber-500/20"}`}
                  >
                    {user.emailVerified ? "Verified" : "Pending"}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {/* Provider logic stays same as your original design */}
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-blue-500 bg-blue-500/10 py-1 px-2 rounded-full w-fit mx-auto">
                    {user.accounts?.[0]?.provider === "google" ? (
                      <IconBrandGoogle size={14} />
                    ) : user.accounts?.[0] ? (
                      <IconBrandGithub size={14} />
                    ) : (
                      <IconMail size={14} />
                    )}
                    {user.accounts?.[0]?.provider || "Credentials"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl h-8 w-8 p-0"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Remove {user.email} permanently?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(user.id)}
                          className="bg-destructive rounded-xl"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (Your design remains unchanged) */}
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

export default function UserTable(props: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <UserTableContent {...props} />
    </Suspense>
  );
}
