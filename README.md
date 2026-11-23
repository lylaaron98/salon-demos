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

End-to-end tests (Playwright, desktop 1440×900 and mobile 390×844) run against a production build
and are not part of CI yet:

```bash
pnpm --filter web exec playwright install chromium   # once
pnpm build && pnpm --filter web test:e2e
```

## Continuous integration

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`. It installs with
pnpm (store and Turborepo caches restored) and runs `lint`, `typecheck`, `test` and `build` as
separate jobs, so each shows up as its own status check.

## Licence

[MIT](./LICENSE) © Aaron Lee
