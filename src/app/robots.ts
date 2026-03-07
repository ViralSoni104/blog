import { MetadataRoute } from "next";
import { site } from "@/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/auth/", // 💡 Blocks all login/register/reset pages
        "/bookmarks/",
        "/settings/",
        "/api/",
        "/unsubscribe",
        "/search?*",
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
