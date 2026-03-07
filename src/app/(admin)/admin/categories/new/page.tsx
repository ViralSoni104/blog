import CategoryForm from "@/components/admin/forms/category-form";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { IconCategory, IconCategoryPlus } from "@tabler/icons-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | New Category",
};

export default function NewCategoryPage() {
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
          { label: "New Category", icon: IconCategoryPlus },
        ]}
        isAdmin={true}
      />
      <h1 className="text-2xl font-semibold mb-6 mt-2">Create Category</h1>
      <CategoryForm />
    </div>
  );
}
