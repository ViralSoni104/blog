"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  bulkDeleteSubscribers,
  bulkToggleSubscriberStatus,
  cleanupInactiveSubscribers,
  deleteSubscriber,
} from "@/actions/(admin)/subscriber-action";
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
  IconMail,
  IconTrash,
  IconX,
  IconCopy,
  IconCheck,
  IconLoader2,
  IconMailOff,
  IconDownload,
  IconAlertTriangle,
  IconGhost,
} from "@tabler/icons-react";
import { SiteBreadcrumb } from "../../ui/breadcrumb";
import { getActiveEmailsAction } from "@/actions/(admin)/subscriber-action";
import { copyToClipboard, exportToCSV } from "@/lib/utils";
import { Subscriber } from "@/generated/prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";

interface Props {
  subscribers: Subscriber[]; // 💡 Typed
  currentPage: number;
  totalPages: number;
  search: string;
}

function SubscriberTableContent({
  subscribers,
  currentPage,
  totalPages,
  search,
}: Props) {
  const nav = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultSearch = search;
  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [isCopying, setIsCopying] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = subscribers.map((s) => s.id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  // 3. Logic: Select/Unselect individual row
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id),
    );
  };

  const isAllSelected =
    subscribers.length > 0 && selectedIds.length === subscribers.length;
  const handleExport = () => {
    const dataToExport = subscribers
      .filter((s) => selectedIds.length === 0 || selectedIds.includes(s.id))
      .map((s) => ({
        email: s.email,
        joined: s.createdAt,
        status: s.isActive,
      }));

    exportToCSV(dataToExport, "subscribers.csv");
    toast.success("CSV Downloaded", { position: "top-right" });
  };
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

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const emails = await getActiveEmailsAction();
      await copyToClipboard(emails.join(", "));
      toast.success("Active emails copied to clipboard", {
        position: "top-right",
      });
    } catch {
      toast.error("Failed to copy emails", { position: "top-right" });
    }
    setIsCopying(false);
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteSubscriber(id);
      if (res.success) toast.success(res.message, { position: "top-right" });
      else toast.error(res.message, { position: "top-right" });
    });
  };

  const handleCleanup = () => {
    startTransition(async () => {
      const res = await cleanupInactiveSubscribers();
      if (res.success) {
        toast.success(`Deactivated ${res.count} long-inactive subscribers`, {
          position: "top-right",
        });
      } else {
        toast.error("Cleanup failed", { position: "top-right" });
      }
    });
  };

  // 2. Updated handleAction to support "activate"
  const handleAction = (type: "delete" | "deactivate" | "activate") => {
    startTransition(async () => {
      let result;
      if (type === "delete") {
        result = await bulkDeleteSubscribers(selectedIds);
      } else {
        // Toggle active status based on type
        result = await bulkToggleSubscriberStatus(
          selectedIds,
          type === "activate",
        );
      }

      if (result.success) {
        toast.success(
          `Action completed for ${selectedIds.length} subscribers`,
          { position: "top-right" },
        );
        setSelectedIds([]);
      } else {
        toast.error("Operation failed", { position: "top-right" });
      }
    });
  };

  const selectedSubscribers = subscribers.filter((s) =>
    selectedIds.includes(s.id),
  );

  // Check if all selected are already active
  const allSelectedAreActive =
    selectedSubscribers.length > 0 &&
    selectedSubscribers.every((s) => s.isActive);

  // Check if all selected are already inactive
  const allSelectedAreInactive =
    selectedSubscribers.length > 0 &&
    selectedSubscribers.every((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <SiteBreadcrumb
        items={[{ label: "Subscribers", icon: IconMail }]}
        isAdmin={true}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Newsletter</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative md:w-64 w-full">
            <Input
              placeholder="Search emails..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pr-8 rounded-xl"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="rounded-xl gap-2"
            disabled={isCopying}
          >
            {isCopying ? (
              <IconLoader2 size={16} className="animate-spin" />
            ) : (
              <IconCopy size={16} />
            )}
            <span className="hidden sm:inline">Copy Active</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-4">
        {/* 1. PRIMARY ACTIONS (Right on Desktop, Top on Mobile) */}
        <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
          <div>
            <Button
              variant="secondary"
              onClick={handleExport}
              className="flex-1 md:flex-none w-full md:w-auto"
            >
              <IconDownload className="size-4 mr-2" />
              {selectedIds.length > 0
                ? `Export (${selectedIds.length})`
                : "Export All"}
            </Button>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={handleCleanup}
              disabled={isPending}
              className="bg-blue-500 text-white hover:bg-blue-600 flex-1 md:flex-none  w-full md:w-auto"
            >
              {isPending ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconGhost size={16} />
              )}
              Cleanup Ghost Subs
            </Button>
          </div>
        </div>

        {/* 2. BULK ACTIONS (Left on Desktop, Below Primary on Mobile) */}
        <div className="flex gap-2 items-center w-full md:w-auto">
          {selectedIds.length > 0 ? (
            <div className="flex md:flex-row w-full flex-col md:items-center gap-2 animate-in fade-in slide-in-from-left-2 overflow-x-auto">
              {/* Deactivate Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending || allSelectedAreInactive}
                  >
                    <IconMailOff className="size-4 mr-2" />{" "}
                    {allSelectedAreInactive
                      ? "Already Inactive"
                      : "Unsubscribe"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Unsubribe the Subscribers?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will set{" "}
                      <strong className="text-red-500 font-extrabold mx-1">
                        * {selectedIds.length} *
                      </strong>{" "}
                      users to inactive. They will remain in your database but
                      won&apos;t receive future newsletters.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction("deactivate")}
                      className="rounded-xl bg-amber-600 hover:bg-amber-700"
                    >
                      Confirm Unsubscription
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Activate Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending || allSelectedAreActive}
                  >
                    <IconMail className="size-4 mr-2" />{" "}
                    {allSelectedAreActive ? "Already Active" : "Activate"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Activate the Subscribers?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will set{" "}
                      <strong className="text-red-500 font-extrabold mx-1">
                        * {selectedIds.length} *
                      </strong>{" "}
                      users to active. They will start receiving newsletters
                      again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction("activate")}
                      className="rounded-xl bg-amber-600 hover:bg-amber-700"
                    >
                      Confirm Activation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Delete Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isPending}>
                    <IconTrash className="size-4 mr-2" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl border-destructive/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <IconAlertTriangle className="text-destructive size-5" />
                      Permanent Deletion
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to delete{" "}
                      <strong className="text-red-500 font-extrabold mx-1">
                        * {selectedIds.length} *
                      </strong>{" "}
                      subscribers. This action is final and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction("delete")}
                      className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
                    >
                      {isPending ? (
                        <IconLoader2 className="animate-spin" />
                      ) : (
                        "Delete Forever"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="text-sm font-medium text-muted-foreground italic flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-muted-foreground" />
              Select subscribers to manage in bulk
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-background border-muted-foreground/30 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[500px] md:min-w-full">
            <TableHeader>
              <TableRow className="bg-muted/50 border-muted-foreground/30">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead className="font-bold">Email Address</TableHead>
                <TableHead className="text-center font-bold">Status</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((sub: Subscriber) => (
                <TableRow
                  key={sub.id}
                  className="border-muted-foreground/30 hover:bg-muted/10"
                >
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedIds.includes(sub.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(sub.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium py-4 break-all">
                    {sub.email}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className={`mx-auto flex items-center justify-center gap-1 text-[10px] font-bold uppercase py-1 px-2 rounded-full w-fit border ${sub.isActive ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20"}`}
                    >
                      {sub.isActive ? (
                        <IconCheck size={12} />
                      ) : (
                        <IconX size={12} />
                      )}
                      {sub.isActive ? "Active" : "Inactive"}
                    </div>
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
                      <AlertDialogContent className="rounded-2xl w-fit pb-0">
                        <AlertDialogHeader className="flex flex-col justify-start items-start">
                          <AlertDialogTitle>
                            Remove Subscriber?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-pretty text-start font-medium max-w-xs text-muted-foreground">
                            This will delete{" "}
                            <span className="font-bold text-foreground">
                              {sub.email}
                            </span>{" "}
                            from the newsletter.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="!bg-background">
                          <div className="flex flex-row gap-2 justify-between w-full">
                            <AlertDialogCancel className="rounded-xl">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sub.id)}
                              className="!bg-destructive text-destructive-foreground rounded-xl"
                            >
                              Delete
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
      </div>

      <div className="flex justify-between items-center px-2">
        <p className="text-xs font-mono text-muted-foreground uppercase">
          Page {currentPage} / {totalPages}
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
    </div>
  );
}

export default function SubscriberTable(props: Props) {
  return (
    <Suspense fallback={<Loading />}>
      <SubscriberTableContent {...props} />
    </Suspense>
  );
}
