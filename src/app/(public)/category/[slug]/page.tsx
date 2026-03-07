import { notFound, redirect } from "next/navigation";
import { getInfinitePosts } from "@/actions/post-action";
import { ContainerSection } from "@/components/ui/container";
import ArticlesSection from "@/components/sections/articles-section";
import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { site } from "@/site";
import { getCategoryBySlug } from "@/data/category";
import { cache } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const getMemoizedCategory = cache(async (slug: string) => {
  return await getCategoryBySlug(slug);
});

async function buildCachedMetadata(
  paramsPromise: Promise<{ slug: string }>,
): Promise<Metadata> {
  "use cache"; // 💡 Safely caches the database lookup
  const { slug } = await paramsPromise;
  const category = await getMemoizedCategory(slug);

  if (!category) return { title: "Category Not Found" };

  const title = category.name;
  const description =
    category.description || `Browse articles about ${category.name}.`;

  // 💡 Construct the dynamic OG Image URL using your new API route
  const ogUrl = new URL(`${site.url}/api/og`);
  ogUrl.searchParams.set("title", title);
  ogUrl.searchParams.set("excerpt", description);

  return {
    title: `${title} Articles`,
    description: description,
    openGraph: {
      title: `${title} Articles · ${site.name}`,
      description: description,
      type: "website",
      url: `${site.url}/category/${slug}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${title} category on ${site.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} Articles`,
      description: description,
      images: [ogUrl.toString()],
    },
  };
}

// 2. Export standard generateMetadata, passing the raw promise directly
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return buildCachedMetadata(params);
}

export default async function CategorySlugPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params.slug;
  const page = Number(searchParams.page) || 1;
  const user = await currentUser();

  const category = await getMemoizedCategory(slug);

  if (!category) return notFound();

  // 💡 Fetch using the URL page parameter
  const { data, totalPages } = await getInfinitePosts(page, 12, slug, user?.id);

  const validMaxPage = Math.max(1, totalPages);

  if (page > validMaxPage) {
    const redirectParams = new URLSearchParams();
    redirectParams.set("page", validMaxPage.toString());

    // Redirect securely to the correct category slug and valid page
    redirect(`/category/${slug}?${redirectParams.toString()}`);
  }

  return (
    <ContainerSection className="flex w-full flex-col gap-0">
      <ArticlesSection
        initialArticles={data}
        initialTotalPages={totalPages}
        initialCategory={slug}
        currentPage={page} // 💡 Pass the current server page down
        title={category.name}
        description={
          category.description || `All articles related to ${category.name}.`
        }
      />
    </ContainerSection>
  );
}
