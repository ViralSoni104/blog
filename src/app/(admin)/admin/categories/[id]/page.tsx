import { db } from "@/lib/db";
import CategoryForm from "@/components/admin/forms/category-form";
import { Metadata } from "next";
import { IconCategory, IconEdit } from "@tabler/icons-react";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Update Category",
};

interface Props {
  params: Promise<{ id: string }>;
}

// 💡 1. The Async Fetcher: Awaits the params AND the DB query inside the Suspense boundary
async function CategoryFetcher({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;

  const category = await db.category.findUnique({
    where: { id: id },
  });

  if (!category) return null;

  return <CategoryForm initialData={category} />;
}

// 💡 2. The Page Shell: Removed 'async'! This now renders synchronously and instantly.
export default function EditCategoryPage({ params }: Props) {
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
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Edit Category</h1>

      {/* 💡 3. Pass the raw promise down to the fetcher */}
      <Suspense
        fallback={
          <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted/50 border border-border" />
        }
      >
        <CategoryFetcher paramsPromise={params} />
      </Suspense>
    </div>
  );
}
