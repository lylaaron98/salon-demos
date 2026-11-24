import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace packages ship TypeScript source (tokens.ts is generated; ui is TSX + CSS Modules).
  transpilePackages: ["@salon-demos/tokens", "@salon-demos/ui"],
  // Photos are free Unsplash images (content/media.ts). next/image serves them
  // through the built-in optimiser, so they arrive from our own origin (no extra
  // connection before the LCP image) as AVIF or WebP at the size each slot needs.
  // Optimised files are cached for a month, which keeps transformations well inside
  // the Vercel Hobby allowance.
  images: {
    formats: ["image/avif", "image/webp"],
    // 55 for the LCP photos (smaller files, still sharp at their size); 75 elsewhere.
    qualities: [55, 75],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/photo-*" }],
    minimumCacheTTL: 2_678_400,
  },
};

export default nextConfig;
