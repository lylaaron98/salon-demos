# Salon demos

A portfolio monorepo of multi-brand salon websites for **Orrin Collective**, a fictional Singapore
beauty group, and its three fictional specialist studios:

| Brand                  | Specialism                               | Tagline                          |
| ---------------------- | ---------------------------------------- | -------------------------------- |
| **Sable & Shear**      | Premium hair atelier                     | Cut with intent.                 |
| **Dewlab Skin Studio** | Facials and non-invasive skin aesthetics | Skin, studied.                   |
| **Rootwell**           | Scalp care and wellness                  | Healthy hair starts at the root. |

> **This is a portfolio demo.** Every brand, name, tagline, colour, logo, photo and line of copy is
> fictional and original. No real salon, beauty group or employer is represented, and no real
> bookings are made.

## What it shows

One shared design-token source drives three builds:

| Build                        | Stack                                                | Brand(s)           |
| ---------------------------- | ---------------------------------------------------- | ------------------ |
| Multi-brand showcase         | Next.js (App Router, TypeScript) on Vercel Hobby     | All three          |
| Elementor site               | WordPress + Elementor (free) + Hello Elementor child | Sable & Shear      |
| Block theme site             | WordPress block theme (`theme.json` from tokens)     | Dewlab Skin Studio |
| Divi child theme (code only) | Divi child theme CSS generated from the same tokens  | Dewlab Skin Studio |

## Content editing

The showcase's copy (services, team, FAQs, banners) is edited in [Keystatic](https://keystatic.com),
a free Git-based CMS, at `/keystatic`. Every save is a commit, and the build validates the content
before it goes live. See [docs/cms.md](docs/cms.md).

## Zero-cost stack

Everything runs on free tiers: GitHub (public repo + Actions), Vercel Hobby for the Next.js
showcase, InfinityFree free subdomains for the WordPress sites, and WordPress Playground blueprints
as a serverless backup demo. Elementor Pro features are covered with custom PHP (widgets, theme
templates) instead of a paid licence. Divi deliverables are kept as code and docs until a licence
is bought.

## Repo layout

```
apps/
  web/              Next.js App Router showcase
packages/
  config/           Shared ESLint, Prettier and tsconfig presets
  tokens/           Design tokens (Style Dictionary): CSS, TS, Elementor, theme.json, Divi
  ui/               Shared React components (CSS Modules on token variables)
wordpress/          Themes, plugin and Playground blueprints (coming soon)
```

## Getting started

Requirements: Node 22 (see `.nvmrc`) and pnpm 10 (`corepack enable` picks up the pinned version).

```bash
pnpm install        # install all workspace dependencies
pnpm dev            # run the Next.js app at http://localhost:3000
```

Routes in `apps/web`:

| Route           | What it is                                                                   |
| --------------- | ---------------------------------------------------------------------------- |
| `/`             | Orrin Collective group hub linking the three studios                         |
| `/[brand]`      | Brand home (`sable`, `dewlab`, `rootwell`), statically generated; others 404 |
| `/[brand]/book` | Five-step booking flow (outlet, service, date and time, details, confirm)    |
| `/components`   | Every `@salon-demos/ui` component under a brand switcher                     |
| `/tokens`       | Token swatches, type scale and contrast checks per theme                     |

The booking flow keeps each step in the URL (`?step=time&outlet=novena&...`), so back, forward and
refresh work. Slots come from a deterministic mock (`apps/web/lib/booking/availability.ts`, Singapore
time, closed days honoured). Details are validated by one zod schema on the client and in a server
action, which returns a fake reference such as `ORN-7K3Q`: nothing is stored, nothing is charged,
and the final submit works without JavaScript. Analytics events go to `window.dataLayer` with the
names from the design brief and no personal data.

Brand content lives in typed data files under `apps/web/content/brands/`. The `[brand]` layout sets
`data-brand` on its wrapper, so every token variable inside resolves to that brand's theme.

### SEO

Every page sets its title, description, canonical URL, Open Graph and Twitter card through the
Next.js Metadata API (`apps/web/lib/seo/metadata.ts`). Social cards are generated per brand at
build time with `next/og`, coloured from that brand's tokens (`/opengraph-image`,
`/[brand]/opengraph-image`). `app/sitemap.ts` lists the indexable pages and `app/robots.ts` blocks
crawlers on Vercel preview deployments. Booking steps and confirmations are `noindex`.

Canonical URLs come from `SITE_URL` (or `NEXT_PUBLIC_SITE_URL`), then the production domain
`https://orrin-collective.vercel.app`.

JSON-LD (`apps/web/lib/seo/jsonld.ts`, typed with `schema-dts`, one `@graph` per page):

| Page          | Nodes                                                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`           | `Organization` (the group, `subOrganization` per brand), `WebSite`                                                                                                                       |
| `/[brand]`    | `HairSalon`, `BeautySalon` or `HealthAndBeautyBusiness` with each outlet as a `location` (address, `geo`, opening hours, `priceRange`); services `ItemList`; `FAQPage`; `BreadcrumbList` |
| Utility pages | `BreadcrumbList`                                                                                                                                                                         |

No ratings, reviews or `sameAs` links are marked up: the brands are fictional. Unit tests in
`apps/web/test/seo.test.ts` check the shape of every brand's graph.

### Analytics and consent

Google Tag Manager loads only when `NEXT_PUBLIC_GTM_ID` is set to a container id (`GTM-XXXXXXX`);
without it nothing is requested from Google. GA4 is configured inside the container.

**Consent Mode v2.** An inline script in `<head>` runs before GTM and sets every signal
(`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) to `denied`, then
re-applies a remembered choice. The cookie banner offers Accept all, Reject all and Customise
(analytics, marketing) with equal weight, remembers the choice for a year in `localStorage`, sends
`gtag('consent', 'update', …)` plus a `consent_update` event, and can be reopened from any "Cookie
settings" link. It is shown by CSS from the first paint and is `position: fixed`, so it causes no
layout shift; it comes first in the tab order and moves focus into the panel and back again.

**Events.** Everything goes through `track()` in `apps/web/lib/analytics.ts`, with the names from
the design brief (§6.7) so the WordPress builds report into the same GA4 funnel. Every event carries
`brand` (`sable`, `dewlab`, `rootwell` or `orrin`), `site_platform: "nextjs"`, `page_type`
(`group_home`, `brand_home`, `booking`, `booking_confirmation`, `utility`), `outlet_id`,
`service_id`, `campaign_id` and `flow` (`booking` on booking pages, otherwise `null`). No names,
phone numbers or emails are ever pushed.

| Event               | Fires when                                               | Extra parameters                                                           |
| ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| `contact_click`     | Any `tel:` or WhatsApp link is clicked, anywhere         | `method` (`call`, `whatsapp`), `location` (see below)                      |
| `booking_start`     | First booking step rendered (once per session and brand) | `entry_step`, `entry_source`                                               |
| `booking_step_view` | Each booking step is shown                               | `step_number`, `step_name`                                                 |
| `select_outlet`     | Step 1 completed                                         | `outlet_id`, `selection_method`                                            |
| `select_service`    | Step 2 completed                                         | `service_id`, `service_category`, `price`, `stylist_level`, `addons_count` |
| `select_slot`       | Step 3 completed                                         | `days_ahead`, `daypart`, `staff_pref`                                      |
| `no_slots_shown`    | A day with no free slots is shown                        | `date`                                                                     |
| `details_submit`    | Step 4 is valid                                          | `marketing_opt_in`, `returning`                                            |
| `form_error`        | A validation error is shown                              | `field`, `error_type`                                                      |
| `booking_confirm`   | Confirm pressed                                          | `value`, `currency`                                                        |
| `booking_complete`  | Success page rendered (deduplicated per booking)         | `booking_ref` (SHA-256, 16 hex), `value`, `currency`, `is_trial`           |
| `booking_abandon`   | Page hidden before the confirm step                      | `last_step`                                                                |
| `consent_update`    | A cookie choice is saved (no common parameters)          | the four Consent Mode signals                                              |

`contact_click.location` is `header`, `footer`, `sticky`, `outlet_card`, `cta_band` or `page` on
the marketing pages (one delegated listener, `ContactTracker`, reads the nearest
`data-contact-location` and `data-outlet-id`), and `booking_header`, `booking_empty`,
`booking_error` or `success` in the booking flow, whose links track themselves with the booking
context (`data-analytics="manual"`).

GA4 funnel: `booking_start → select_outlet → select_service → select_slot → details_submit →
booking_complete`. Mark `booking_complete` as the key event.

## Commands

All commands run from the repo root and fan out through Turborepo.

| Command          | What it does                                               |
| ---------------- | ---------------------------------------------------------- |
| `pnpm dev`       | Start every package in watch/dev mode                      |
| `pnpm build`     | Production build of every package (Next.js included)       |
| `pnpm lint`      | ESLint in every package, then a Prettier check of the repo |
| `pnpm typecheck` | `tsc --noEmit` in every package                            |
| `pnpm test`      | Unit tests (token contrast, UI helpers, booking logic)     |
| `pnpm format`    | Format the whole repo with Prettier                        |

Run a single package with a filter, for example `pnpm --filter web dev`.

End-to-end tests (Playwright, desktop 1440×900 and mobile 390×844) run against a production
build. They cover the booking flow, cookie consent, `contact_click` tracking and axe-core scans
(`e2e/a11y.spec.ts`: the group hub, each brand home and booking step 1, plus the open cookie banner;
any serious or critical violation fails):

```bash
pnpm --filter web exec playwright install chromium   # once
pnpm build && pnpm --filter web test:e2e
```

Lighthouse CI (mobile preset, 3 runs per URL, median asserted) runs the group hub and the three
brand homes against `next start`. Locally, point `CHROME_PATH` at a Chromium:

```bash
pnpm build && CHROME_PATH=/path/to/chrome pnpm --filter web lhci
```

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It installs with
pnpm (store and Turborepo caches restored) and runs each check as its own job:

| Job          | What it does                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| `lint`       | ESLint and the Prettier check                                                                          |
| `typecheck`  | `tsc --noEmit` in every package                                                                        |
| `test`       | Unit tests                                                                                             |
| `build`      | Production build; uploads `apps/web/.next` (without its cache) as an artifact                          |
| `e2e`        | Downloads the build, installs Chromium, runs Playwright and the axe checks at both viewports           |
| `lighthouse` | Downloads the build and runs Lighthouse CI against `next start`, uploading to temporary public storage |

`e2e` and `lighthouse` reuse the `build` artifact, so the app is built once per run. Lighthouse
budgets (`apps/web/lighthouserc.cjs`, mobile): performance ≥ 0.9, accessibility ≥ 0.95, SEO ≥
0.95, CLS < 0.1, LCP < 2.5 s, TBT < 200 ms; best practices ≥ 0.95 is a warning.

## Licence

[MIT](./LICENSE) © Aaron Lee
