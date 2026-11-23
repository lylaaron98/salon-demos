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
  ui/               Shared React components (coming soon)
wordpress/          Themes, plugin and Playground blueprints (coming soon)
```

## Getting started

Requirements: Node 22 (see `.nvmrc`) and pnpm 10 (`corepack enable` picks up the pinned version).

```bash
pnpm install        # install all workspace dependencies
pnpm dev            # run the Next.js app at http://localhost:3000
```

## Commands

All commands run from the repo root and fan out through Turborepo.

| Command          | What it does                                               |
| ---------------- | ---------------------------------------------------------- |
| `pnpm dev`       | Start every package in watch/dev mode                      |
| `pnpm build`     | Production build of every package (Next.js included)       |
| `pnpm lint`      | ESLint in every package, then a Prettier check of the repo |
| `pnpm typecheck` | `tsc --noEmit` in every package                            |
| `pnpm format`    | Format the whole repo with Prettier                        |

Run a single package with a filter, for example `pnpm --filter web dev`.

## Licence

[MIT](./LICENSE) © Aaron Lee
