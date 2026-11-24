/**
 * Whether the Keystatic admin can save on this deployment.
 *
 * In development it writes to local files. In a production build it needs the
 * GitHub app (docs/cms.md), because a deployed site's files are read-only.
 */
export const cmsEnabled =
  process.env.NODE_ENV !== "production" ||
  Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);
