# WordPress

This folder holds the WordPress code for the two builder-based brand sites,
following the zero-cost route (no paid licences, no paid hosting):

| Path (planned)                   | What                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| `themes/sable-hello-child/`      | Sable & Shear: Hello Elementor child theme (free Elementor)  |
| `themes/dewlab-block/`           | Dewlab Skin Studio: block theme driven by token `theme.json` |
| `themes/divi-child/`             | Dewlab Divi child theme, documented but not deployed         |
| `plugins/salon-booking-enquiry/` | PHP plugin: Elementor widget, enquiry CPT, REST endpoint     |
| `playground/`                    | WordPress Playground blueprints for one-click demos          |

Design values are never typed by hand here: they come from `packages/tokens`.

## Build

`wordpress/` is a pnpm workspace package (`@salon-demos/wordpress`) so Turborepo builds it after
`@salon-demos/tokens`:

```sh
pnpm build                                   # whole repo, or:
pnpm --filter @salon-demos/wordpress build   # tokens + fonts + Elementor kit -> theme assets/build/
pnpm --filter @salon-demos/wordpress lint    # ESLint for the vanilla JS shipped to browsers
```

The build copies `packages/tokens/dist/tokens.css` and `elementor-kit.json` into
`themes/sable-hello-child/assets/build/` (git-ignored), adds self-hosted WOFF2 fonts and writes an
Elementor kit zip. See [`themes/sable-hello-child/README.md`](themes/sable-hello-child/README.md).
