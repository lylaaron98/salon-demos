import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Production allows crawling; Vercel preview and development deployments block it
 * (`VERCEL_ENV` is only "production" on the production domain). Builds outside Vercel
 * (local, CI) are treated as production so Lighthouse's SEO audit sees the real file.
 * Booking pages are not disallowed here: they carry `noindex`, which crawlers must be
 * allowed to fetch to see.
 */
export default function robots(): MetadataRoute.Robots {
  const env = process.env.VERCEL_ENV;
  if (env && env !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
