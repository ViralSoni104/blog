"use server";

import { db } from "@/lib/db";
import { categorySchema, CategoryInput } from "@/schemas";
import { revalidateTag } from "next/cache";

// const ADMIN_PATH = "/admin/categories";
export async function bulkDeleteCategories(ids: string[]) {
  try {
    await db.category.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    // 💡 Clear the cache so the admin table updates immediately
    revalidateTag("categories", "max");

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete categories" };
  }
}
export async function createCategory(values: CategoryInput) {
  const validated = categorySchema.safeParse(values);

  if (!validated.success) {
    return { success: false, message: "Invalid fields" };
  }

  try {
    await db.category.create({
      data: validated.data,
    });

    revalidateTag("categories", "max");
    return { success: true, message: "Category created" };
  } catch {
    return {
      success: false,
      message: "Slug or name already exists",
    };
  }
}

export async function updateCategory(id: string, values: CategoryInput) {
  const validated = categorySchema.safeParse(values);

  if (!validated.success) {
    return { success: false, message: "Invalid fields" };
  }

  try {
    await db.category.update({
      where: { id },
      data: validated.data,
    });

    revalidateTag("categories", "max");
    return { success: true, message: "Category updated" };
  } catch {
    return {
      success: false,
      message: "Update failed",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({ where: { id } });

    revalidateTag("categories", "max");
    return { success: true, message: "Category deleted" };
  } catch {
    return { success: false, message: "Delete failed" };
  }
}
