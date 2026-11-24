/**
 * Canonical site origin. Every canonical URL, Open Graph URL, sitemap entry and
 * JSON-LD `@id` is built from it.
 *
 * Order: `SITE_URL`, then `NEXT_PUBLIC_SITE_URL`, then the production domain below.
 * Vercel's `VERCEL_PROJECT_PRODUCTION_URL` is deliberately not used: with several
 * vercel.app aliases it can name the auto-assigned one rather than this domain.
 * Previews therefore canonicalise to production, which is what we want.
 */
export const DEFAULT_SITE_URL = "https://orrin-collective.vercel.app";

type Env = Record<string, string | undefined>;

export function resolveSiteUrl(env: Env = process.env): string {
  const raw = [env.SITE_URL, env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL].find(
    (value): value is string => !!value && /^https?:\/\//.test(value.trim()),
  )!;
  return raw.trim().replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "Orrin Collective (demo)";

/** Absolute URL for a site path ("/sable" -> "https://…/sable"). */
export function absoluteUrl(path = "/", base: string = SITE_URL): string {
  return new URL(path, `${base}/`).toString();
}
