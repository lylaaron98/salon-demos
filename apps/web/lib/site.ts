/**
 * Canonical site origin. Every canonical URL, Open Graph URL, sitemap entry and
 * JSON-LD `@id` is built from it.
 *
 * Order: `SITE_URL`, then `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain
 * (`VERCEL_PROJECT_PRODUCTION_URL`, set on every Vercel build), then the default
 * Hobby subdomain. Previews therefore canonicalise to production, which is what we want.
 */
export const DEFAULT_SITE_URL = "https://salon-demos.vercel.app";

type Env = Record<string, string | undefined>;

export function resolveSiteUrl(env: Env = process.env): string {
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;
  const raw = [env.SITE_URL, env.NEXT_PUBLIC_SITE_URL, vercel, DEFAULT_SITE_URL].find(
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
