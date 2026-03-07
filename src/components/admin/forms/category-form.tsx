"use client";

import * as z from "zod";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "@/schemas";
import {
  createCategory,
  updateCategory,
} from "@/actions/(admin)/category-actions";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { redirect } from "next/navigation";

type Schema = z.infer<typeof categorySchema>;

interface Props {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
  };
}

export default function CategoryForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<Schema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
    },
  });

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const res = initialData
        ? await updateCategory(initialData.id, data)
        : await createCategory(data);

      if (res.success) {
        toast.success(res.message, { position: "top-right" });
        redirect("/admin/categories");
      } else {
        toast.error(res.message, { position: "top-right" });
      }
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup className="flex flex-col gap-5">
        {/* Name */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Name</FieldLabel>
              <Input
                {...field}
                disabled={isPending}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value);

                  if (!initialData) {
                    form.setValue("slug", slugify(value));
                  }
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Slug */}
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Slug</FieldLabel>
              <Input {...field} disabled={isPending} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Description</FieldLabel>
              <Textarea {...field} disabled={isPending} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {initialData ? "Update Category" : "Create Category"}
        </Button>
      </FieldGroup>
    </form>
  );
}
