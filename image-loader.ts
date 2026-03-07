export default function imageKitLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const ikId = process.env.NEXT_PUBLIC_IMAGEKIT_ID || "zlvkzojfn"; // Fallback to ID directly if env fails
  const endpoint = `https://ik.imagekit.io/${ikId}`;

  // 1. If the src is already a full ImageKit URL, strip the endpoint to get the path
  const path = src.replace(endpoint, "").replace(/^\//, "");

  // 2. If it's a full external URL (like from a DB), we need to use ImageKit's 'origin' feature
  // but for your case, we'll assume we just want the path if it's already an IK link
  if (path.startsWith("http")) {
    // This handles cases where the src might be a totally different URL
    return src;
  }

  const params = [`w-${width}`];
  if (quality) params.push(`q-${quality}`);

  const paramsString = params.join(",");

  return `${endpoint}/${path}?tr=${paramsString}`;
}
