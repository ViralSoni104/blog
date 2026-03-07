import PostForm from "@/components/admin/forms/post-form";
import { SiteBreadcrumb } from "@/components/ui/breadcrumb";
import { getAllCategories } from "@/data/post";
import { IconArticle, IconPencilPlus } from "@tabler/icons-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Create Post",
};

export default async function NewPostPage() {
  const categories = await getAllCategories();

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
      <h1 className="text-2xl font-semibold mb-6 mt-2">Create Post</h1>
      <PostForm categories={categories} />
    </div>
  );
}
