import type { Metadata } from "next";
import CategoriesSection from "@/components/sections/categories-section";
import { ContainerSection } from "@/components/ui/container";
import { getInfiniteCategories } from "@/actions/category-actions";
import { Suspense } from "react";
import LoadingCategories from "@/app/(public)/category/loading";
import { site } from "@/site";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore articles by topic. From frontend engineering to UI design and developer mental models.",
  openGraph: {
    title: `Categories · ${site.name}`,
    description:
      "Explore articles by topic. From frontend engineering to UI design and developer mental models.",
    url: `${site.url}/category`,
  },
};

// Pass the searchParams promise down
export default function CategoryPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <ContainerSection className="flex w-full flex-col">
      <Suspense fallback={<LoadingCategories />}>
        <CategoriesSectionWrapper searchParams={props.searchParams} />
      </Suspense>
    </ContainerSection>
  );
}

// Await the promise inside Suspense boundary to prevent blocking the route
async function CategoriesSectionWrapper({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;

  const { data, totalPages } = await getInfiniteCategories(page, 12, "newest");

  const validMaxPage = Math.max(1, totalPages);
  if (page > validMaxPage) {
    const params = new URLSearchParams();
    params.set("page", validMaxPage.toString());
    redirect(`/category?${params.toString()}`);
  }

  return (
    <CategoriesSection
      initialCategories={data}
      initialTotalPages={totalPages}
      currentPage={page}
    />
  );
}
