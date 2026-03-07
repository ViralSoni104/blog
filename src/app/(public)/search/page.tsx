import { Suspense } from "react";
import {
  advancedSearchPosts,
  advancedSearchCategories,
  type AdvancedSearchResult,
  type AdvancedSearchCategoryResult,
} from "@/actions/search-action";
import { AdvancedSearchContent } from "@/components/sections/advanced-search-section";
import { ContainerSection } from "@/components/ui/container";
import { IconLoader2 } from "@tabler/icons-react";
import { site } from "@/site";

export const metadata = {
  title: "Advanced Search",
  description:
    "Search and filter through all published articles and categories.",
  openGraph: {
    title: `Advanced Search · ${site.name}`,
    description:
      "Search and filter through all published articles and categories.",
    url: `${site.url}/search`,
  },
};

async function SearchResults({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const params = await searchParamsPromise;

  const query = typeof params.q === "string" ? params.q : "";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const type = typeof params.type === "string" ? params.type : "articles";

  // 💡 Strictly Typed Empty States
  let postData: {
    data: AdvancedSearchResult[];
    totalPages: number;
    totalItems: number;
  } = { data: [], totalPages: 0, totalItems: 0 };

  let categoryData: {
    data: AdvancedSearchCategoryResult[];
    totalPages: number;
    totalItems: number;
  } = { data: [], totalPages: 0, totalItems: 0 };
  const isZeroState = !query;

  // 💡 Smart Fetching: Only hit the database for the active tab
  if (!isZeroState) {
    if (type === "categories") {
      categoryData = await advancedSearchCategories(query, page, 12);
    } else {
      postData = await advancedSearchPosts(query, page, 12, sort);
    }
  }

  return (
    <AdvancedSearchContent
      searchType={type as "articles" | "categories"}
      postData={postData.data}
      categoryData={categoryData.data}
      initialTotalPages={
        type === "categories" ? categoryData.totalPages : postData.totalPages
      }
      initialTotalItems={
        type === "categories" ? categoryData.totalItems : postData.totalItems
      }
      isZeroState={isZeroState}
    />
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <ContainerSection className="min-h-[calc(100svh-10rem)]">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <IconLoader2 className="size-8 animate-spin mb-4 text-primary" />
            <p className="animate-pulse font-mono text-sm uppercase tracking-widest">
              Searching Archives...
            </p>
          </div>
        }
      >
        <SearchResults searchParamsPromise={searchParams} />
      </Suspense>
    </ContainerSection>
  );
}
