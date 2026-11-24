"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader for Unsplash photos. `src` is the photo id, e.g.
 * "photo-1634449571010-02389ed0f9b0".
 *
 * Unsplash's CDN (imgix) resizes, crops and serves AVIF or WebP from `auto=format`,
 * so the browser still gets a responsive `srcset` from next/image, and nothing
 * counts against the Vercel image-optimisation quota on the free plan.
 */
export default function unsplashLoader({ src, width, quality }: ImageLoaderProps): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith("/")) return src;
  const params = new URLSearchParams({
    w: String(width),
    q: String(quality ?? 70),
    auto: "format",
    fit: "crop",
  });
  return `https://images.unsplash.com/${src}?${params}`;
}
