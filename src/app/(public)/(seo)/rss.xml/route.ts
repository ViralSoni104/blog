import { site } from "@/site";
import { getPostsForRSS } from "@/actions/post-action"; // 💡 Import the new action

const SITE_URL = site.url;

export async function GET() {
  // 1. Fetch optimized posts via the Server Action
  const posts = await getPostsForRSS();

  // 2. Map over the posts to create XML items
  const items = posts
    .map((post) => {
      const articleUrl = `${SITE_URL}/articles/${post.slug}`;

      return `
      <item>
        <title><![CDATA[${post.title}]]></title>
        <description><![CDATA[${post.excerpt}]]></description>
        <link>${articleUrl}</link>
        <guid isPermaLink="true">${articleUrl}</guid>
        <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${site.name}]]></title>
    <link>${SITE_URL}</link>
    <description><![CDATA[${site.description}]]></description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
