import { site } from "@/site";
const SITE_URL = site.url;
const INDEXNOW_KEY = "a9f4c6b0c7e94d2c8a8c0a7d12345678";

export async function submitIndexNow(urls: string[]) {
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: SITE_URL.replace(/^https?:\/\//, ""),
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    return;
  }
}
