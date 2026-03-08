import PostForm from "@/components/admin/forms/post-form";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { getAllCategories } from "@/data/post";
import { IconArticle, IconPencilPlus } from "@tabler/icons-react";
import { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin | Create Post",
};

// 💡 1. The Async Loader does the heavy lifting
async function NewPostFormLoader() {
  await connection();
  const categories = await getAllCategories();
  return <PostForm categories={categories} />;
}

// 💡 2. The Main Page has NO async keyword!
export default function NewPostPage() {
  return (
    <div className="p-6">
      <SiteBreadcrumb
        className="mb-2"
        items={[
          { label: "Posts", href: "/admin/posts", icon: IconArticle },
          { label: "Add Post", icon: IconPencilPlus },
        ]}
        isAdmin={true}
      />
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Create Post</h1>

      {/* 💡 3. Suspense boundary catches the loader */}
      <Suspense
        fallback={
          <div className="h-[600px] w-full animate-pulse bg-muted/50 rounded-xl border border-border" />
        }
      >
        <NewPostFormLoader />
      </Suspense>
    </div>
  );
}
