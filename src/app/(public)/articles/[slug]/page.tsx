import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPublicArticleBySlug,
  getUserArticleEngagement,
  getArticleMeta,
  getArticleStats,
} from "@/actions/post-action";
import { ContainerSection } from "@/components/ui/container";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { EngagementBar } from "@/components/ui/engagement-bar";
import { ArticleContent } from "@/components/ui/article-content";
import { IconClockHour3, IconEye } from "@tabler/icons-react";
import type { Metadata } from "next";
import { getCommentsTree } from "@/actions/comment-action";
import { CommentSection } from "@/components/sections/comment-section";
import { ViewTracker } from "@/components/ui/view-tracker";
import { ArticleJsonLd } from "@/app/(public)/(seo)/article-json-ld";
import { getBlurPlaceholder } from "@/lib/utils";
import { site } from "@/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// 1. Create a helper that caches the entire metadata generation process
async function buildCachedMetadata(
  paramsPromise: Promise<{ slug: string }>,
): Promise<Metadata> {
  "use cache";
  // The cache boundary safely absorbs the dynamic delay!
  const { slug } = await paramsPromise;
  const meta = await getArticleMeta(slug);

  if (!meta) return { title: "Article Not Found" };

  const title = meta.seoTitle || meta.title;
  const description = meta.seoDescription || meta.excerpt;

  // 💡 Construct the dynamic OG Image URL
  const ogUrl = new URL(`${site.url}/api/og`);
  ogUrl.searchParams.set("title", title);
  if (description) {
    ogUrl.searchParams.set("excerpt", description);
  }

  // 💡 Use the database cover image if it exists, otherwise fallback to the generated image
  const ogImage = meta.image || ogUrl.toString();

  return {
    title: title,
    description: description,
    keywords: meta.seoKeywords?.split(","),
    openGraph: {
      title: title,
      description: description,
      type: "article",
      publishedTime: meta.createdAt.toISOString(),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImage],
    },
  };
}

// 2. Export standard generateMetadata, but DO NOT await params here!
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  // Pass the raw promise directly into our cached function
  return buildCachedMetadata(params);
}

// 2. Main Page Component
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Fetch all post data & user states safely from the action
  const post = await getPublicArticleBySlug(slug);
  if (!post) return notFound();
  const [engagement, stats, initialComments] = await Promise.all([
    getUserArticleEngagement(post.id),
    getArticleStats(post.id), // 💡 Use the new micro-cached action
    getCommentsTree(post.id),
  ]);
  const { initialIsLiked, initialIsBookmarked, isLoggedIn } = engagement;

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const seoData = {
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    createdAt: post.createdAt,
    slug: post.slug,
    author: {
      name: post.author.name,
    },
  };

  return (
    <ContainerSection className="flex w-full flex-col gap-6 md:gap-8 pb-12 overflow-hidden max-w-full">
      <ArticleJsonLd post={seoData} />
      <ViewTracker postId={post.id} />
      {/* --- Breadcrumb --- */}
      <div className="w-full min-w-0 flex items-center justify-start md:justify-center">
        <SiteBreadcrumb
          items={[
            { label: "Articles", href: "/articles" },
            { label: post.title },
          ]}
          className="w-full flex-nowrap truncate justify-start md:justify-center [&_ol]:flex-nowrap [&_ol]:justify-start md:[&_ol]:justify-center [&_li:last-child]:truncate [&_li:last-child]:min-w-0"
        />
      </div>

      {/* --- Article Header --- */}
      <header className="flex flex-col items-start md:items-center text-left md:text-center max-w-3xl mx-auto space-y-4 md:space-y-6 w-full">
        <div className="flex flex-wrap justify-start md:justify-center gap-2 w-full">
          {post.categories.map((cat) => (
            <span
              key={cat.id}
              className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap"
            >
              {cat.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight w-full">
          {post.title}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed w-full">
          {post.excerpt}
        </p>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-center md:justify-center gap-y-4 gap-x-3 pb-4 pt-4 text-xs md:text-sm font-mono text-muted-foreground border-b border-t border-dashed border-border/60 w-full">
          <div className="flex items-center gap-2 shrink-0">
            <Image
              src={post.author.image || "/default-avatar.png"}
              alt={post.author.name}
              width={24}
              height={24}
              className="rounded-full object-cover aspect-square"
            />
            <span className="font-sans font-medium truncate max-w-[120px] sm:max-w-none">
              {post.author.name}
            </span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center justify-end md:justify-start shrink-0">
            <span>{formattedDate}</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="md:ml-0 ml-1 flex items-center gap-1.5 shrink-0">
            <IconClockHour3 size={16} className="text-primary/70" />{" "}
            <span>{post.readingTime} min</span>
          </div>
          <span className="hidden md:inline">•</span>
          <div className="flex items-center justify-end md:justify-start gap-1.5 shrink-0">
            <IconEye size={16} className="text-primary/70" />{" "}
            <span>{post.viewCount + 1} views</span>
          </div>
        </div>
      </header>

      {/* --- Cover Image --- */}
      {post.image && (
        <div className="relative w-full max-w-5xl mx-auto aspect-video rounded-xl md:rounded-3xl overflow-hidden border border-border/30 shadow-md mt-4 md:mt-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            blurDataURL={getBlurPlaceholder(post.image)}
          />
        </div>
      )}

      {/* --- Article Body --- */}
      <article className="max-w-3xl mx-auto w-full px-2 md:px-0">
        <ArticleContent html={post.content} />
      </article>
      <CommentSection postId={post.id} initialComments={initialComments} />
      {/* --- Floating Engagement Bar --- */}
      <div className="fixed bottom-8 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
        <div className="pointer-events-auto">
          <EngagementBar
            postId={post.id}
            title={post.title}
            initialLikes={stats?._count.likes ?? 0}
            initialComments={stats?._count.comments ?? 0}
            initialShares={stats?.shareCount ?? 0}
            initialIsLiked={initialIsLiked}
            initialIsBookmarked={initialIsBookmarked}
            isLoggedIn={isLoggedIn}
            image={post.image}
          />
        </div>
      </div>
    </ContainerSection>
  );
}
