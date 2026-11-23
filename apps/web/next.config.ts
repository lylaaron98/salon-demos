import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace packages ship TypeScript source (tokens.ts is generated; ui is TSX + CSS Modules).
  transpilePackages: ["@salon-demos/tokens", "@salon-demos/ui"],
};

export default nextConfig;
