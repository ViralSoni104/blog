import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { site } from "@/site";
import JsonLd from "@/app/(public)/(seo)/json-ld";
import { websiteSchema } from "@/lib/schema";
import { SessionProvider } from "next-auth/react";
import { AnimationProvider } from "@/components/provider/animation-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const SITE_URL = site.url;
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: site.name,
    template: "%s · " + site.name,
  },

  description: site.description,

  keywords: [
    "web development",
    "frontend engineering",
    "react",
    "next.js",
    "javascript",
    "typescript",
    "code logic",
    "software development",
    "building in public",
  ],

  authors: [{ name: site.author }],
  creator: site.creator,

  robots: {
    index: false,
    follow: false,
  },

  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    url: SITE_URL,
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: site.name + " - " + site.description,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    creator: site.creatorHandle,
    images: ["/og/default.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/rss.xml`,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        <JsonLd data={websiteSchema} />
      </head>
      <body className="font-sans antialiased">
        <AnimationProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider>{children}</SessionProvider>
          </ThemeProvider>
        </AnimationProvider>
      </body>
    </html>
  );
}
