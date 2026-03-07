"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// 💡 NEW: Your custom Field components
import { Field, FieldGroup, FieldError } from "@/components/ui/field";

import {
  commentSchema,
  updateCommentSchema,
  reportCommentSchema,
  type CommentInput,
  type UpdateCommentInput,
  type ReportCommentInput,
} from "@/schemas";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Server Actions & Types
import {
  addComment,
  editComment,
  deleteComment,
  reportComment,
  type CommentTreeItem,
} from "@/actions/comment-action";

import {
  IconDots,
  IconEdit,
  IconTrash,
  IconFlag,
  IconMessageCircle,
  IconX,
  IconArrowsSort,
} from "@tabler/icons-react";
import { cn, getInitials, getRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { usePostHog } from "posthog-js/react";

interface CommentSectionProps {
  postId: string;
  initialComments: CommentTreeItem[];
}

// --- MAIN RESPONSIVE WRAPPER ---
export function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-comments", handleOpen);
    return () => window.removeEventListener("open-comments", handleOpen);
  }, []);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const InnerContent = (
    <CommentContent postId={postId} initialComments={initialComments} />
  );

  return (
    <Drawer
      open={isOpen}
      onOpenChange={setIsOpen}
      direction={isDesktop ? "right" : "bottom"}
    >
      <DrawerContent
        className={
          isDesktop
            ? "fixed bottom-0 left-auto right-0 top-0 mt-0 h-screen w-[400px] sm:w-[450px] rounded-none border-l border-border/50 bg-muted shadow-2xl [&>div.mx-auto]:hidden"
            : "h-[85vh] bg-background border-none shadow-2xl"
        }
      >
        <DrawerHeader
          className={
            isDesktop
              ? "mb-1 pt-[18px] border-b border-border/50 text-left"
              : "border-b border-border/50 pt-4 text-left"
          }
        >
          <DrawerTitle className="text-lg font-bold flex items-center gap-2 justify-between">
            Responses ({initialComments.length})
            <IconX
              size={18}
              className="cursor-pointer hover:opacity-80"
              onClick={() => setIsOpen(false)}
            />
          </DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto w-full h-full px-4 sm:px-4 pt-4 pb-6">
          {InnerContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- REUSABLE INNER CONTENT (Main Add Comment) ---
function CommentContent({ postId, initialComments }: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const posthog = usePostHog();
  const form = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "", postId, parentId: null },
  });
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const currentContent = form.watch("content") || "";
  const isMainDisabled =
    !isLoggedIn || isPending || currentContent.trim().length < 2;
  const onSubmit = form.handleSubmit((data: CommentInput) => {
    if (!isLoggedIn)
      return toast.error("Please log in to comment.", {
        position: "top-center",
      });
    startTransition(async () => {
      const res = await addComment(data);
      if (res.success) {
        toast.success("Comment posted!", { position: "top-center" });
        form.reset();
        posthog.capture("comment_posted", {
          article_id: postId,
          is_reply: false,
          comment_length: data.content.length, // Cool to see if people write essays!
        });
      } else toast.error(res.message, { position: "top-center" });
    });
  });

  const [sortBy, setSortBy] = useState("newest");
  const [sortedComments, setSortedComments] = useState(initialComments);

  useEffect(() => {
    const sorted = [...initialComments].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "most_replies":
          return b.replies.length - a.replies.length;
        case "least_replies":
          return a.replies.length - b.replies.length;
        default:
          return 0;
      }
    });
    setSortedComments(sorted);
  }, [initialComments, sortBy]);

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-1 mb-6 shadow-sm p-3 rounded-xl border border-border/50 bg-muted/20 focus-within:bg-background focus-within:border-primary/50 transition-colors"
      >
        <div
          className={cn(
            "flex items-center gap-2",
            isLoggedIn ? "mb-1" : "mb-0",
          )}
        >
          <span className="text-sm font-semibold text-foreground/80">
            <Link
              href={`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`}
              className="text-primary hover:underline"
            >
              {isLoggedIn
                ? "Leave a response"
                : "Log in to respond to this article"}
            </Link>
          </span>
        </div>

        {isLoggedIn && (
          <>
            <FieldGroup>
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      {...field}
                      placeholder="What are your thoughts?"
                      disabled={!isLoggedIn || isPending}
                      className="min-h-[60px] resize-none border-none focus-visible:ring-0 shadow-none px-0 bg-transparent text-[15px] placeholder:text-muted-foreground"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex justify-end pt-2 border-t border-border/40 mt-1">
              <Button
                type="submit"
                disabled={isMainDisabled}
                size="sm"
                className="rounded-full h-8 px-5 text-xs font-semibold"
              >
                {isPending ? "Publishing..." : "Respond"}
              </Button>
            </div>
          </>
        )}
      </form>

      <hr className="mb-4 border-border/50" />
      <div className="flex items-center justify-start md:justify-end mb-8">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-fit gap-2 shadow-none bg-transparent hover:bg-muted/50 text-xs font-semibold transition-colors focus:ring-0">
            <IconArrowsSort className="size-3.5 opacity-70" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent
            align="end"
            className="rounded-xl shadow-xl border-border/50"
          >
            <SelectItem value="newest" className="text-xs">
              Newest
            </SelectItem>
            <SelectItem value="oldest" className="text-xs">
              Oldest
            </SelectItem>
            <SelectItem value="most_replies" className="text-xs">
              Most Replies
            </SelectItem>
            <SelectItem value="least_replies" className="text-xs">
              Least Replies
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-8">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <IconMessageCircle size={36} className="mx-auto opacity-20 mb-2" />
            <p className="text-sm">No responses yet.</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <ThreadItem key={comment.id} comment={comment} postId={postId} />
          ))
        )}
      </div>
    </>
  );
}

// --- THREAD ITEM (Replies) ---
function ThreadItem({
  comment,
  postId,
}: {
  comment: CommentTreeItem;
  postId: string;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isPending, startTransition] = useTransition();
  const posthog = usePostHog();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const replyForm = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "", postId, parentId: comment.id },
  });

  useEffect(() => {
    if (isReplying && textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isReplying]);

  const currentReply = replyForm.watch("content") || "";
  const strippedReply = currentReply.replace(/(@[a-zA-Z0-9_]+)/g, "").trim();
  const isReplyDisabled = !isLoggedIn || isPending || strippedReply.length < 2;

  const onReplySubmit = replyForm.handleSubmit((data: CommentInput) => {
    if (!isLoggedIn)
      return toast.error("Please log in.", { position: "top-center" });
    startTransition(async () => {
      const res = await addComment(data);
      if (res.success) {
        replyForm.reset();
        setIsReplying(false);
        setShowReplies(true);
        posthog.capture("comment_posted", {
          article_id: postId,
          is_reply: true,
          comment_length: data.content.length,
        });
      } else toast.error(res.message, { position: "top-center" });
    });
  });

  const triggerReplyToUser = (username: string) => {
    // 💡 FIX: Strip spaces and special characters to create a valid handle
    // Example: "VR Soni" -> "VRSoni" | "John-Doe" -> "JohnDoe"
    const mentionHandle = username.replace(/[^a-zA-Z0-9_]/g, "");

    replyForm.setValue("content", `@${mentionHandle} `);
    setIsReplying(true);
    setShowReplies(true);
  };

  return (
    <div className="flex flex-col">
      <CommentCard
        data={comment}
        onReplyClick={() => {
          setIsReplying(!isReplying);
          replyForm.reset();
        }}
      />

      {comment.replies.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="text-[13px] font-semibold text-primary/80 hover:text-primary mt-3 ml-[44px] text-left w-fit transition-colors"
        >
          {showReplies
            ? "Hide replies"
            : `View ${comment.replies.length} replies`}
        </button>
      )}

      {showReplies && (
        <div className="mt-4 ml-4 pl-4 md:pl-5 border-l-2 border-border/40 space-y-6 animate-in fade-in slide-in-from-top-2">
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              data={reply}
              onReplyClick={() => triggerReplyToUser(reply.user.name || "User")}
            />
          ))}
        </div>
      )}

      {isReplying && (
        <div className="mt-4 ml-[44px] p-3 rounded-xl border border-border/50 bg-muted/10 animate-in fade-in">
          <form onSubmit={onReplySubmit}>
            <FieldGroup>
              <Controller
                name="content"
                control={replyForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      placeholder="Write a reply..."
                      className="min-h-[50px] text-[14px] border-none shadow-none focus-visible:ring-0 px-0 bg-transparent resize-none"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <div className="flex gap-2 justify-end pt-2 border-t border-border/40 mt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsReplying(false)}
                className="rounded-full h-7 px-3 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isReplyDisabled}
                className="rounded-full h-7 px-4 text-xs"
              >
                {isPending ? "..." : "Reply"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function FormattedContent({
  content,
  commentId,
}: {
  content: string;
  commentId: string;
}) {
  const parts = content.split(/(@[a-zA-Z0-9_]+)/g);

  return (
    <span className="text-[15px] mt-1.5 leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
      {parts
        // Map to objects to hide the index from the static scanner
        .map((part, i) => ({ id: `${commentId}-part-${i}`, text: part }))
        .map((p) =>
          p.text.startsWith("@") ? (
            <span
              key={p.id}
              className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium"
            >
              {p.text}
            </span>
          ) : (
            // Regular text needs a key too when returning from an array
            <span key={p.id}>{p.text}</span>
          ),
        )}
    </span>
  );
}

// --- REUSABLE COMMENT CARD UI (Edit & Report) ---
function CommentCard({
  data,
  onReplyClick,
}: {
  data: CommentTreeItem;
  onReplyClick: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const currentUserId = session?.user?.id;
  const isOwner = currentUserId === data.user.id;

  // Edit Form
  const editForm = useForm<UpdateCommentInput>({
    resolver: zodResolver(updateCommentSchema),
    defaultValues: { commentId: data.id, content: data.content },
  });

  const currentEdit = editForm.watch("content") || "";
  const isEditDisabled = isPending || currentEdit.trim().length < 2;

  const onEditSubmit = editForm.handleSubmit((values: UpdateCommentInput) => {
    startTransition(async () => {
      const res = await editComment(values);
      if (res.success) {
        setIsEditing(false);
        toast.success("Comment updated!", { position: "top-center" });
      } else toast.error(res.message, { position: "top-center" });
    });
  });

  // Report Form
  const reportForm = useForm<ReportCommentInput>({
    resolver: zodResolver(reportCommentSchema),
    defaultValues: { commentId: data.id, reason: "" },
  });

  const currentReport = reportForm.watch("reason") || "";
  const isReportDisabled = isPending || currentReport.trim().length < 10;

  const onReportSubmit = reportForm.handleSubmit(
    (values: ReportCommentInput) => {
      startTransition(async () => {
        const res = await reportComment(values);
        if (res.success) {
          toast.success(res.message, { position: "top-center" });
          setIsReportOpen(false);
          reportForm.reset();
        } else toast.error(res.message, { position: "top-center" });
      });
    },
  );

  return (
    <div className="flex gap-3 w-full group">
      <Avatar className="size-8 shrink-0 mt-0.5">
        <AvatarImage
          src={data.user.image || undefined}
          className="object-cover"
        />
        <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
          {getInitials(data.user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-[14px] leading-tight text-foreground/90">
              {data.user.name}
            </span>
            <span className="text-[12px] text-muted-foreground mt-0.5">
              {getRelativeTime(data.createdAt)}
            </span>
          </div>

          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground -mt-1 -mr-2 transition-colors"
                >
                  <IconDots size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 rounded-xl">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <IconEdit size={14} className="mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        deleteComment(data.id);
                        toast.success("Comment deleted!", {
                          position: "top-center",
                        });
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <IconTrash size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => setIsReportOpen(true)}>
                    <IconFlag size={14} className="mr-2" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2">
            <form onSubmit={onEditSubmit}>
              <FieldGroup>
                <Controller
                  name="content"
                  control={editForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Textarea {...field} className="text-sm min-h-[60px]" />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isEditDisabled}
                  className="rounded-full h-7 px-4 text-xs"
                >
                  Save
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <p className="text-[15px] mt-1.5 leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
            <FormattedContent content={data.content} commentId={data.id} />
          </p>
        )}

        {!isEditing && (
          <button
            onClick={onReplyClick}
            className="text-[13px] font-medium text-muted-foreground hover:text-foreground mt-2 transition-colors"
          >
            Reply
          </button>
        )}
      </div>

      {/* 💡 SHADCN DIALOG FOR REPORTING */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Help us understand what is wrong with this comment. Your report
              will be sent to the site administrators.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onReportSubmit} className="space-y-4 pt-2">
            <FieldGroup>
              <Controller
                name="reason"
                control={reportForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      placeholder="e.g. This is spam, offensive, or violates community guidelines..."
                      {...field}
                      className="resize-none min-h-[100px]"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsReportOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isReportDisabled}>
                {isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
