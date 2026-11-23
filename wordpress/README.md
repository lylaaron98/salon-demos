# WordPress

This folder holds the WordPress code for the two WordPress brand sites,
following the zero-cost route (no paid licences, no paid hosting):

| Path                             | What                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| `themes/sable-hello-child/`      | Sable & Shear: Hello Elementor child theme (free Elementor)  |
| `themes/dewlab-block/`           | Dewlab Skin Studio: block theme driven by token `theme.json` |
| `themes/dewlab-divi-child/`      | Dewlab Divi child theme, ready for a licence, not deployed   |
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

`scripts/build-theme-assets.mjs` runs one module per theme (`scripts/themes/*.mjs`, shared helpers
in `scripts/lib/`). All output is git-ignored:

- **Sable & Shear** (`themes/sable-hello-child/assets/build/`): `tokens.css`, self-hosted WOFF2
  fonts and the Elementor kit (JSON + zip). See
  [`themes/sable-hello-child/README.md`](themes/sable-hello-child/README.md).
- **Dewlab** (`themes/dewlab-block/theme.json` and `assets/build/`): theme.json v3 merged from
  `packages/tokens/dist/theme.json` and the hand-written `theme.base.json`, with `fontFace` for the
  self-hosted fonts, plus resolved token variables. See
  [`themes/dewlab-block/README.md`](themes/dewlab-block/README.md).
- **Dewlab on Divi** (`themes/dewlab-divi-child/assets/build/`): `divi-child.css` from the token
  build, self-hosted fonts and the Global Colors list as JSON. See
  [`themes/dewlab-divi-child/README.md`](themes/dewlab-divi-child/README.md).

## PHP quality tools

`composer.json` holds dev tools only (nothing is installed on the server):

```sh
cd wordpress
composer install
composer check   # php -l on every file, then PHPCS and PHPStan
composer phpcs   # WordPress Coding Standards + PHPCompatibilityWP (phpcs.xml.dist)
composer phpstan # level 6 with WordPress stubs (phpstan.neon.dist)
composer phpcbf  # auto-fix what PHPCS can
```

PHPStan reads `stubs/elementor.php` (the few Elementor classes the code touches; Elementor has no
official stubs package) and `stubs/constants.php`. PHP files are invisible to Prettier and ESLint,
so the root `pnpm lint` is unaffected.
