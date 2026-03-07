import { db } from "@/lib/db";
import CategoryForm from "@/components/admin/forms/category-form";
import { Metadata } from "next";
import { IconCategory, IconEdit } from "@tabler/icons-react";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Admin | Update Category",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await db.category.findUnique({
    where: { id: id },
  });

  if (!category) return null;

  return (
    <div className="p-6 md:max-w-xl">
      <SiteBreadcrumb
        className="mb-2"
        items={[
          {
            label: "Categories",
            href: "/admin/categories",
            icon: IconCategory,
          },
          { label: "Update Category", icon: IconEdit },
        ]}
        isAdmin={true}
      />
      <h1 className="text-2xl font-semibold mb-6 mt-2">Edit Category</h1>
      <CategoryForm initialData={category} />
    </div>
  );
}
