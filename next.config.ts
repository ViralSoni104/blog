import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  cacheComponents: true,
  experimental: {
    // Enable the Next 15 "use cache" directive
    useCache: true,
  },
  images: {
    minimumCacheTTL: 60,
    loader: "custom",
    loaderFile: "./image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            // s-maxage: Caches on Vercel's CDN for 1 hour
            // stale-while-revalidate: Serves old content while updating in the background
            value: "public, s-maxage=3600, stale-while-revalidate=59",
          },
        ],
      },
      {
        // Specific caching for images/static assets
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} 
const nextConfig = {
  // Reduces the weight of your deployment
  output: 'standalone', 
  
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // s-maxage: Caches on Vercel's CDN for 1 hour
            // stale-while-revalidate: Serves old content while updating in the background
            value: 'public, s-maxage=3600, stale-while-revalidate=59',
          },
        ],
      },
      {
        // Specific caching for images/static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; */
