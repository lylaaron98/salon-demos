# @salon-demos/tokens

The single source of design truth for Orrin Collective and its three fictional brands, built with
[Style Dictionary](https://styledictionary.com) v5 from W3C Design Tokens (DTCG) JSON.

## Tiers

```
src/primitives.json        tier 1  raw values: --p-aubergine-800, --space-4, --font-size-md ...
src/semantic.json          tier 2  purpose tokens components consume: --color-action-bg ...
                                   (defaults = neutral Orrin Collective group theme)
src/brands/<brand>.json    tier 3  re-points semantic tokens per brand: sable, dewlab, rootwell
```

Components only ever read semantic tokens. Values follow the design brief (sections 2.1 to 2.5).

## Outputs

`pnpm --filter @salon-demos/tokens build` writes `dist/` (git-ignored, rebuilt by Turborepo and CI):

| File                 | Consumer                  | Contents                                                                                           |
| -------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| `tokens.css`         | Next.js (`apps/web`)      | `:root` primitives + group theme, then one `[data-brand="sable"\|"dewlab"\|"rootwell"]` block each |
| `tokens.ts`          | TypeScript, tests         | Resolved values per theme (`themes`, `primitives`, `cssVars`, `brandIds`)                          |
| `elementor-kit.json` | Sable & Shear (Elementor) | Site Settings global colours + fonts, kit `site-settings.json` shape                               |
| `theme.json`         | Dewlab (WP block theme)   | `settings.color.palette`, `typography.fontFamilies/fontSizes`, `spacing`, `layout`                 |
| `divi-child.css`     | Dewlab (Divi child theme) | Token variables + body, heading, link, button and form styles; Global Colors list                  |

Package exports: `@salon-demos/tokens` (tokens.ts), `@salon-demos/tokens/tokens.css`,
`@salon-demos/tokens/contrast` and each WordPress file by name.

### Using `tokens.css`

Set `data-brand` on `<html>` (or any wrapper) to switch theme. Font stacks read two hooks,
`--font-display` and `--font-body`, so an app can point them at self-hosted fonts (for example
`next/font` variables); without them the plain family name is used.

## Tests

`pnpm --filter @salon-demos/tokens test` (Node's built-in test runner) checks every theme's text
and button colour pairs against WCAG AA 4.5:1, and input borders / focus rings against 3:1.

## Notes and inferred values

The brief does not specify a few semantic values; these were filled in and can be changed in one
place:

- Group (`:root`) theme: `bg-subtle` = white, `border-subtle` = `#DDD8D0`, `radius-input` = 2px,
  `radius-chip` = pill.
- `radius-chip` per brand = the brand's button radius (Rootwell: 8px).
- `action-bg-pressed` = the hover colour for every brand (the primitives are named "hover / pressed").
