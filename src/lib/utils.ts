import { Ratelimit } from "@upstash/ratelimit";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2); // Limits to 2 characters (e.g., "JD")
};

// lib/utils.ts (or wherever you keep helpers)

export async function copyToClipboard(text: string) {
  try {
    // 1. Try the modern API (requires HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      throw new Error("Clipboard API unavailable");
    }
  } catch {
    // 2. Fallback for non-HTTPS or mobile restrictions
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure the textarea is not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      textArea.remove();
      return true;
    } catch {
      textArea.remove();
      return false;
    }
  }
}

// src/lib/utils.ts
export const checkRateLimit = async (
  limiter: Ratelimit,
  headers: () => Promise<Headers>,
  identifier?: string, // 💡 Optional identifier (like userId)
) => {
  if (process.env.NODE_ENV === "development") {
    return { success: true };
  }
  const headersList = await headers();
  // 💡 Use identifier if provided, fallback to IP
  const id = identifier || headersList.get("x-forwarded-for") || "127.0.0.1";

  const { success } = await limiter.limit(id);

  if (!success) {
    return {
      success: false,
      message:
        "For your security, we've limited requests. Please try again after some time!",
    };
  }
  return { success: true };
};

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000,
  );

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const { unit, seconds } of units) {
    if (diffInSeconds >= seconds || unit === "second") {
      const value = Math.floor(diffInSeconds / seconds);
      return rtf.format(-value, unit);
    }
  }
  return "just now";
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
) {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((obj) =>
    Object.values(obj)
      .map((val) => `"${val}"`)
      .join(","),
  );
  const csvContent = [headers, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const getBlurPlaceholder = (src: string) => {
  // We ask ImageKit for a tiny, 10px wide, blurry version of the image
  const key = process.env.NEXT_PUBLIC_IMAGEKIT_ID;
  return `https://ik.imagekit.io/${key}/${src}?tr=w-10,bl-10,q-10`;
};
