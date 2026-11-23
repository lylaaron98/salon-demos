# @salon-demos/ui

Accessible React components shared by the three brands. They are styled with CSS Modules that read
only semantic token variables from `@salon-demos/tokens` (no Tailwind, no hex values), so the same
code renders every brand under its `data-brand` scope.

| Component          | Notes                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Button`           | `primary`, `secondary`, `ghost`, `whatsapp`, `call`; sizes `sm` 44px, `md` 48px, `lg` 56px; `loading` sets `aria-busy`. `ButtonLink` for navigation          |
| `Header`           | Utility bar + main bar (≥1024px); 60px bar + drawer below. Drawer: `role="dialog"`, focus trap, Esc/scrim close, focus returns to the menu button. Skip link |
| `Hero`             | `split` (4:5 desktop, 4:3 mobile) and `full` (scrim over image)                                                                                              |
| `ServiceCard`      | `responsive`, `vertical`, `horizontal`, `featured`; stretched title link, one tab stop                                                                       |
| `PricingTable`     | `menu` (real `<table>`, WAI-ARIA tabs switch tier columns on mobile) and `tiers` cards                                                                       |
| `PromoBanner`      | `inline`, `card`, `announcement` (dismissed for 7 days in `localStorage`, SSR-rendered)                                                                      |
| `Testimonial`      | `card` and `quote`; SVG star rating with a text label                                                                                                        |
| `StaffCard`        | `profile` (4:5) and `compact` (64px avatar), labelled as demo team                                                                                           |
| `OutletCard`       | `list` and `compact`; open status computed client-side in Singapore time                                                                                     |
| `FAQ`              | heading > `button[aria-expanded]` + region, 56px rows                                                                                                        |
| `StickyBookBar`    | Mobile only (<1024px); appears after the hero CTA leaves view, hides at the footer                                                                           |
| `Footer`           | 4 columns on `bg-inverse`; Services and sign-up columns become accordions on mobile                                                                          |
| `MediaPlaceholder` | Token gradient at a fixed aspect ratio, standing in for photography                                                                                          |

Shared rules: every interactive target is at least 44×44px, focus is a 2px `--color-focus-ring`
outline (`--color-focus-ring-inverse` on dark surfaces), and transitions are switched off under
`prefers-reduced-motion` (token durations also collapse there).

Components with state are marked `"use client"`; the rest render on the server.

## Scripts

- `pnpm --filter @salon-demos/ui test` runs unit tests for the pure helpers in `src/lib` (prices,
  tel/WhatsApp/Maps links, opening-hours status, keyboard focus maths) with Node's test runner.
- `lint` uses `@salon-demos/config/eslint/react` (React hooks + jsx-a11y rules).

The showcase at `/components` in `apps/web` renders every component under a brand switcher.
