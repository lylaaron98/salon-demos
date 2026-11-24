# Content editing (Keystatic)

The Next.js showcase uses [Keystatic](https://keystatic.com), a free, open-source, Git-based CMS.
There is no database: each brand's editable copy is a JSON file in the repo, and the admin at
`/keystatic` is a form over those files.

## What editors can change

Per brand (`apps/web/content/brands/<id>.json`):

- Tagline, meta description and main booking button
- Hero, promotion banner, closing banner and footer
- Services (name, summary, duration, price, badge)
- Pricing section heading and intro
- "Why us" reasons, team, testimonials and FAQs

Structural data stays in code (`apps/web/content/brands/<id>.ts`), because changing it can break
bookings, SEO or the layout: brand ids, schema.org type, outlets (address, coordinates, opening
hours), the pricing table and first-visit offers.

## Safety net

- `apps/web/content/schema.ts` parses every brand file at build time with zod. An empty required
  field, a bad service ID or a rating outside 1–5 fails the build with the brand and field named.
- `apps/web/content/index.ts` cross-checks content against code: the offer's services must still
  exist and every team member's outlet must be a real outlet.
- On Vercel, a failed build leaves the previous deployment live, so a bad edit never reaches visitors.

## Editing locally

```sh
pnpm dev            # from the repo root
open http://localhost:3000/keystatic
```

Saves write straight to the JSON files. Review and commit them like any other change.

## Editing on the live site (one-time GitHub setup)

Until this is done, `/keystatic` on the live site shows a "not connected yet" page and the API
route returns 404.

1. Locally, create `apps/web/.env.local` with `NEXT_PUBLIC_KEYSTATIC_STORAGE=github`, run
   `pnpm dev` and open `http://localhost:3000/keystatic`.
2. Follow Keystatic's prompt to create a GitHub App, and install it on `lylaaron98/salon-demos`.
   Keystatic writes four variables to `apps/web/.env`.
3. In the GitHub App's settings, add the callback URL
   `https://salon-demos.vercel.app/api/keystatic/github/oauth/callback`.
4. In Vercel → Project → Settings → Environment Variables, add the four variables
   (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`,
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`) and redeploy.

Editors then sign in at `https://salon-demos.vercel.app/keystatic` with GitHub (they need write
access to the repo). Each save is a commit; Vercel rebuilds and the change is live in about a minute.
To review edits before they go live, create a branch in the Keystatic header, save there, and open
a pull request from it: CI and the Vercel preview run as for any code change.
