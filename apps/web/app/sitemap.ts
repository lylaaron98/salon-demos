import type { MetadataRoute } from "next";
import { brandHref, brands } from "@/content";
import { absoluteUrl } from "@/lib/site";

/**
 * Indexable pages only. Booking steps and confirmations are `noindex` and left out.
 * `lastModified` is the build time: the site is static, so a build is a content change.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...brands.map((brand) => ({
      url: absoluteUrl(brandHref(brand.id)),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    { url: absoluteUrl("/tokens"), lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/components"), lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
