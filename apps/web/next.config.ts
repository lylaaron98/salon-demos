import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace packages ship TypeScript source (tokens.ts is generated; ui is TSX + CSS Modules).
  transpilePackages: ["@salon-demos/tokens", "@salon-demos/ui"],
  // Photos are free Unsplash images served by Unsplash's CDN, which resizes them and
  // returns AVIF or WebP. The loader builds those URLs, so next/image still writes a
  // responsive srcset and nothing uses the Vercel image-optimisation quota.
  images: {
    loader: "custom",
    loaderFile: "./lib/unsplash-loader.ts",
  },
};

export default nextConfig;
