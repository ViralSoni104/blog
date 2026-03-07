import PostForm from "@/components/admin/forms/post-form";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { getAllCategories, getPostById } from "@/data/post";
import { IconArticle, IconEdit } from "@tabler/icons-react";
import { IconLoader2 } from "@tabler/icons-react"; // Imported for the skeleton
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Update Post",
};

interface Props {
  params: Promise<{ id: string }>;
}

// 1. The Page Shell: Renders instantly
export default function EditPostPage({ params }: Props) {
  return (
    <div className="p-6">
      <SiteBreadcrumb
        className="mb-2"
        items={[
          { label: "Posts", href: "/admin/posts", icon: IconArticle },
          { label: "Update Post", icon: IconEdit },
        ]}
        isAdmin={true}
      />
      <h1 className="text-2xl font-semibold mb-6 mt-2">Update Post</h1>

      {/* 2. The Suspense Boundary: Catches the DB query delay */}
      <Suspense fallback={<EditPostSkeleton />}>
        {/* Pass the Promise down without awaiting it here */}
        <EditPostContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}

// 3. The Data Fetcher: Awaits the promise INSIDE the Suspense boundary
async function EditPostContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;

  // Run DB queries in parallel for faster load times
  const [post, categories] = await Promise.all([
    getPostById(id),
    getAllCategories(),
  ]);

  if (!post) return notFound();

  return <PostForm initialData={post} categories={categories} />;
}

// 4. The Loading State: Shown immediately while data is fetching
function EditPostSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse mt-4">
      {/* Skeleton fields mimicking the form */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-10 w-full bg-muted rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 bg-muted rounded" />
        <div className="h-[400px] w-full bg-muted rounded-xl" />
      </div>
      <div className="flex justify-start gap-4">
        <div className="h-10 w-24 bg-muted rounded-md" />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground mt-4">
        <IconLoader2 className="animate-spin" size={18} />
        <span className="text-sm">Loading post data...</span>
      </div>
    </div>
  );
}
