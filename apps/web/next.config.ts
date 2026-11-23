import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace packages ship TypeScript source (tokens.ts is generated, not compiled).
  transpilePackages: ["@salon-demos/tokens"],
};

export default nextConfig;
