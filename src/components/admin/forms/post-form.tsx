"use client";
import { useTransition, useState } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostInput } from "@/schemas";
import { createPost, updatePost } from "@/actions/(admin)/post-action";
import { uploadFile } from "@/hooks/use-image-upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandItem,
  CommandInput,
  CommandEmpty,
  CommandList,
} from "@/components/ui/command";
import TiptapEditor from "@/components/admin/ui/tiptap-editor";
import Image from "next/image";
/* ---------------- TYPES ---------------- */

interface CategoryOption {
  id: string;
  name: string;
}

interface InitialPostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  published: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  categories: CategoryOption[];
}

interface Props {
  initialData?: InitialPostData;
  categories: CategoryOption[];
}

/* ---------------- COMPONENT ---------------- */

export default function PostForm({ initialData, categories }: Props) {
  const nav = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      image: initialData?.image ?? null,
      published: initialData?.published ?? false,
      categoryIds: initialData?.categories.map((c) => c.id) ?? [],
      seoTitle: initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
      seoKeywords: initialData?.seoKeywords ?? "",
    },
  });

  const imageValue = useWatch({
    control: form.control,
    name: "image",
  });

  const slugify = (text: string): string =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);

    const res = await uploadFile({
      file,
      maxSize: 500 * 1024,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
      folder: "posts",
    });

    if (res.success && res.uploadResponse) {
      form.setValue("image", res.uploadResponse.url);
      toast.success("Image uploaded");
    } else {
      toast.error(res.message);
    }

    setIsUploading(false);
  };

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const res = initialData
        ? await updatePost(initialData.id, data)
        : await createPost(data);

      if (res.success) {
        toast.success(res.message);
        nav.push("/admin/posts");
      } else {
        toast.error(res.message);
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 w-full lg:max-w-3xl">
      {/* TITLE */}
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-title">
              Title
            </label>
            <Input
              {...field}
              id="post-title"
              onChange={(e) => {
                field.onChange(e.target.value);
                if (!initialData) {
                  form.setValue("slug", slugify(e.target.value));
                }
              }}
            />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* SLUG */}
      <Controller
        name="slug"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-slug">
              Slug
            </label>
            <Input {...field} id="post-slug" />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* EXCERPT */}
      <Controller
        name="excerpt"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="post-excerpt">
              Excerpt
            </label>
            <Textarea rows={3} {...field} id="post-excerpt" />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* CONTENT */}
      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="post-content-editor"
            >
              Content
            </label>
            <TiptapEditor
              id="post-content-editor"
              content={field.value}
              onChange={(html) => field.onChange(html)}
            />
            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* IMAGE */}
      <div className="space-y-2">
        <label className="text-sm font-medium mr-4" htmlFor="post-image">
          Featured Image
        </label>

        <input
          type="file"
          disabled={isUploading}
          id="post-image"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />

        {imageValue && (
          // 💡 Wrapped in a relative container to use 'fill' just like your other components
          <div className="relative w-40 aspect-video mt-2 overflow-hidden rounded-md border border-border/30 shadow-sm">
            <Image
              src={imageValue as string}
              alt="Featured Image Preview"
              fill
              sizes="160px"
              className="object-cover"
              // Optional: If you want to use your blur function here too,
              // just ensure getBlurPlaceholder is imported in this file!
              // blurDataURL={getBlurPlaceholder(form.watch("image") as string)}
            />
          </div>
        )}
      </div>

      {/* CATEGORY TAG SELECT */}
      <Controller
        name="categoryIds"
        control={form.control}
        render={({ field, fieldState }) => (
          <div className="space-y-2">
            <label
              className="text-sm font-medium mr-4"
              htmlFor="category-popover-trigger"
            >
              Categories
            </label>

            <Popover>
              <PopoverTrigger asChild id="category-popover-trigger">
                <Button variant="outline" type="button">
                  Select Categories
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList className="mt-2">
                    <CommandEmpty>No category found</CommandEmpty>

                    {categories.map((cat) => (
                      <CommandItem
                        key={`category-command-${cat.id}`}
                        onSelect={() => {
                          const exists = field.value.includes(cat.id);
                          field.onChange(
                            exists
                              ? field.value.filter((id) => id !== cat.id)
                              : [...field.value, cat.id],
                          );
                        }}
                      >
                        {cat.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((id) => {
                const category = categories.find((c) => c.id === id);
                return (
                  <Badge key={`${category}-badge-${id}`}>
                    {category ? category.name : id}
                  </Badge>
                );
              })}
            </div>

            {fieldState.error && (
              <p className="text-sm text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* PUBLISHED */}
      <Controller
        name="published"
        control={form.control}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <span>Published</span>
          </div>
        )}
      />

      {/* SEO SECTION */}
      <div className="space-y-4 pt-6 border-t">
        <p className="text-sm font-semibold">SEO Settings</p>

        <Controller
          name="seoTitle"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="seo-title">
                SEO Title
              </label>
              <Input {...field} id="seo-title" />
            </div>
          )}
        />

        <Controller
          name="seoDescription"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="seo-desc">
                SEO Description
              </label>
              <Textarea rows={3} {...field} id="seo-desc" />
            </div>
          )}
        />

        <Controller
          name="seoKeywords"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="seo-keywords">
                SEO Keywords (comma separated)
              </label>
              <Input {...field} id="seo-keywords" />
            </div>
          )}
        />
      </div>

      <Button type="submit" disabled={isPending || isUploading}>
        {initialData ? "Update Post" : "Create Post"}
      </Button>
    </form>
  );
}
