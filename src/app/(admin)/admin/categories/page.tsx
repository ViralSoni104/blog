import { getPaginatedCategories } from "@/data/category";
import CategoryTable from "@/components/admin/tables/category-table";
import { Metadata } from "next";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { IconCategory } from "@tabler/icons-react";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Categories",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default function CategoriesPage({ searchParams }: PageProps) {
  return (
    <div className="p-6">
      <SiteBreadcrumb
        className="mb-2"
        items={[{ label: "Categories", icon: IconCategory }]}
        isAdmin={true}
      />
      <Suspense fallback={<TableSkeleton />}>
        <CategoryTableWrapper searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryTableWrapper({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  // The "await" happens inside the Suspense boundary now!
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const PAGE_SIZE = 10;

  const { data, totalPages } = await getPaginatedCategories(
    page,
    PAGE_SIZE,
    search,
  );

  return (
    <CategoryTable
      categories={data}
      currentPage={page}
      totalPages={totalPages}
      search={search}
    />
  );
}

function TableSkeleton() {
  return <div className="h-96 w-full animate-pulse bg-muted rounded-xl" />;
}
