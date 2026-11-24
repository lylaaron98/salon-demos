import type { Photo } from "@/content/media";

/** Phone-sized inline copy of a photo: 750px wide fits a 390px screen at 2x. */
const WIDTH = 750;
/** Skip inlining if the file comes back bigger than this (it would bloat the HTML). */
const MAX_BYTES = 30_000;

/**
 * Fetches a small AVIF of an Unsplash photo at build time and returns it as a
 * data URI, or `undefined` if the fetch fails or the file is too big (the page then
 * falls back to a normal optimised image, so the build never depends on Unsplash).
 *
 * Used for the LCP photo on phones: inlined in the HTML, it paints with the first
 * render instead of waiting on another request over a slow mobile connection.
 */
export async function inlinePhoto(photo: Photo): Promise<string | undefined> {
  const url = `https://images.unsplash.com/${photo.id}?w=${WIDTH}&q=45&fm=avif`;
  try {
    const response = await fetch(url, {
      cache: "force-cache",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return undefined;
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return undefined;
    return `data:image/avif;base64,${bytes.toString("base64")}`;
  } catch {
    return undefined;
  }
}
