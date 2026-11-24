import type { Metadata } from "next";
import { SITE_NAME } from "../site.ts";

type PageMetadataInput = {
  /** Used for <title> (through the layout template unless `absoluteTitle`). */
  title: string;
  description: string;
  /** Site path, e.g. "/sable". Becomes the canonical and og:url (resolved by metadataBase). */
  path: string;
  /** Title for social cards when it should differ from the document title. */
  socialTitle?: string;
  /** Skip the layout title template. */
  absoluteTitle?: boolean;
  /** `noindex, follow` (booking steps and other thin utility pages). */
  noindex?: boolean;
  /**
   * Generated card for pages below the segment that owns the `opengraph-image.tsx`:
   * a page that sets `openGraph` replaces the inherited one, image included.
   */
  image?: { path: string; alt: string };
};

export const GROUP_CARD_ALT = "Orrin Collective preview card: group name and tagline (demo)";
export const BRAND_CARD_ALT =
  "Studio preview card: brand name and tagline on the brand's colours (demo)";

/** Card size used by every `opengraph-image.tsx`. */
const OG = { width: 1200, height: 630 };

/**
 * Metadata for one page: title, description, canonical, Open Graph and Twitter card.
 * Child `openGraph` objects replace the parent's, so the shared fields are repeated here.
 * The card image comes from the nearest `opengraph-image.tsx` file.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  absoluteTitle,
  noindex,
  image,
}: PageMetadataInput): Metadata {
  const cardTitle = socialTitle ?? title;
  const images = image ? [{ url: image.path, alt: image.alt, ...OG }] : undefined;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: cardTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_SG",
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: cardTitle,
      description,
      ...(images ? { images } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
