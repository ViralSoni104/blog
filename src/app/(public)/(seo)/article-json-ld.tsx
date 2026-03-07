import React from "react";
import { site } from "@/site";

// 💡 Define a minimal type of exactly what the SEO schema needs.
// No need for bookmarks, content, or full user objects here.
interface JsonLdPostData {
  title: string;
  excerpt: string | null;
  image: string | null;
  createdAt: Date;
  slug: string;
  author: {
    name: string | null;
  };
}

export function ArticleJsonLd({ post }: { post: JsonLdPostData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.image ? [post.image] : [],
    datePublished: new Date(post.createdAt).toISOString(),
    // If you add an 'updatedAt' field to your DB later, put it here:
    dateModified: new Date(post.createdAt).toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name || "Anonymous", // Fallback for safety
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/articles/${post.slug}`,
    },
  };
  const scriptProps = {
    dangerouslySetInnerHTML: { __html: JSON.stringify(jsonLd) },
  };
  return <script type="application/ld+json" {...scriptProps} />;
}
