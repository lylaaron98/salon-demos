import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { type Photo, photoSrc } from "@/content/media";
import { inlinePhoto } from "@/lib/inline-photo";

/** Phones get the inlined copy below this width; larger screens get the optimised srcset. */
const WIDE = "(min-width: 640px)";

type LcpPhotoProps = {
  photo: Photo;
  /** next/image `sizes`, covering every width (phones use it in browsers without AVIF). */
  sizes: string;
  /** Empty for a decorative photo. */
  alt: string;
};

/**
 * The page's LCP photo, art-directed by screen size:
 * - phones (AVIF-capable): a small AVIF inlined as a data URI at build time, so it
 *   paints with the first render and needs no extra request on a slow connection;
 * - wider screens, and older browsers: the normal optimised srcset, preloaded at
 *   high priority.
 * If the build could not fetch the inline copy, it behaves like a plain preloaded
 * next/image. Renders an <img> that fills its frame, like `<Image fill>`.
 */
export async function LcpPhoto({ photo, sizes, alt }: LcpPhotoProps) {
  const inline = await inlinePhoto(photo);
  const {
    props: { srcSet, ...img },
  } = getImageProps({
    src: photoSrc(photo),
    alt,
    fill: true,
    quality: 55,
    sizes,
    fetchPriority: "high",
    loading: "eager",
  });

  preload(img.src, {
    as: "image",
    imageSrcSet: srcSet,
    imageSizes: img.sizes,
    fetchPriority: "high",
    ...(inline ? { media: WIDE } : {}),
  });

  // getImageProps output is next/image's own <img> markup; the plain element lets it
  // sit inside <picture>.
  // eslint-disable-next-line @next/next/no-img-element
  const fallback = <img {...img} srcSet={srcSet} alt={alt} />;
  if (!inline) return fallback;

  return (
    <picture>
      <source media={WIDE} srcSet={srcSet} sizes={sizes} />
      <source type="image/avif" srcSet={inline} />
      {fallback}
    </picture>
  );
}
