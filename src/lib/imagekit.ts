import ImageKit from "imagekit";
import { FileObject } from "imagekit/dist/libs/interfaces";

const endpointURL =
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT +
  process.env.NEXT_PUBLIC_IMAGEKIT_ID;

const getImageKitInstance = () => {
  const keys = {
    publicKey:
      process.env.IMAGEKIT_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: endpointURL,
  };

  if (!keys.publicKey || !keys.privateKey || !keys.urlEndpoint) {
    throw new Error("ImageKit environment variables are missing!");
  }

  return new ImageKit(
    keys as { publicKey: string; privateKey: string; urlEndpoint: string },
  );
};

/**
 * Regex to extract all image source URLs from HTML content
 */
export function extractImageUrls(html: string): string[] {
  if (!html) return [];
  const urls: string[] = [];
  const endpoint = endpointURL;
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    // 💡 Minimized: Only collect if it belongs to your ImageKit endpoint
    if (src && src.startsWith(endpoint)) {
      urls.push(src);
    }
  }
  return urls;
}

/**
 * Core Batch Deletion Logic
 * 1. Takes array of URLs
 * 2. Resolves them to fileIds
 * 3. Calls the Batch Delete API
 */
export async function deleteImagesByUrls(
  urls: (string | null | undefined)[],
): Promise<void> {
  const endpoint = endpointURL;
  if (!endpoint || urls.length === 0) return;

  const cleanEndpoint = endpoint.endsWith("/")
    ? endpoint.slice(0, -1)
    : endpoint;
  // Filter for valid ImageKit URLs only
  const fileNames = Array.from(
    new Set(
      urls
        .filter((url): url is string => !!url && url.startsWith(cleanEndpoint))
        .map((url) => {
          // Split by slash and take the last part, then remove query params/transformations
          const parts = url.split("/");
          const filenameWithParams = parts[parts.length - 1];
          return filenameWithParams.split("?")[0].split("#")[0];
        }),
    ),
  );

  if (fileNames.length === 0) return;

  const imagekit = getImageKitInstance();

  try {
    // 2. Build the query. ImageKit requires double quotes for values.
    // Example: name IN ["image1.jpg", "image2.webp"]
    const formattedNames = fileNames.map((name) => `"${name}"`).join(", ");
    const query = `name IN [${formattedNames}]`;

    // 3. Execute Search
    const results = await imagekit.listFiles({
      searchQuery: query,
    });

    // Handle case where results might be undefined or empty
    if (!results || results.length === 0) {
      return;
    }

    // 4. Extract IDs with strict Type Guard
    const fileIds = results
      .filter((item): item is FileObject => item.type === "file")
      .map((file) => file.fileId);

    // 5. Batch Delete
    if (fileIds.length > 0) {
      await imagekit.bulkDeleteFiles(fileIds);
    }
  } catch {
    return;
  }
}
