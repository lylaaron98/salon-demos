# WordPress Playground demos

One-click, serverless demos of the two WordPress brand sites. [WordPress Playground](https://wordpress.org/playground/)
boots WordPress in the visitor's browser (PHP compiled to WebAssembly), runs a Blueprint and lands
on the home page. Each visitor gets a fresh, private copy; nothing is hosted and nothing persists.

| Demo                                             | Open in Playground                                                                                                                                                | Blueprint                                      |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Dewlab Skin Studio (block theme)                 | [Launch](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/lylaaron98/salon-demos/main/wordpress/playground/dewlab-block.json)    | [`dewlab-block.json`](dewlab-block.json)       |
| Sable & Shear (Hello Elementor + free Elementor) | [Launch](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/lylaaron98/salon-demos/main/wordpress/playground/sable-elementor.json) | [`sable-elementor.json`](sable-elementor.json) |

You are logged in as `admin` (Playground default), so wp-admin, the Site Editor and the Elementor
editor are one click away. All brands, people, addresses and phone numbers are fictional.

## What each Blueprint does

**`dewlab-block.json`**

1. Installs and activates `salon-booking-enquiry` and the `dewlab-block` theme (release zips).
2. Runs [`setup/dewlab-block.php`](setup/dewlab-block.php): plugin settings (brand Dewlab,
   BeautySalon JSON-LD, Dewlab FAQ), a **Home** page that renders the theme's
   `dewlab-block/home` pattern (hero, first-trial promo, services, prices, testimonials,
   outlets, FAQ, booking form) with the _Landing page_ template, a **Book a facial** page built
   from the booking and FAQ patterns, a **Journal** posts page with one post, and sets Home as
   the static front page.

**`sable-elementor.json`**

1. Installs **Elementor** and **Hello Elementor** from wordpress.org, then
   `salon-booking-enquiry` and the `sable-hello-child` theme (release zips), and activates them.
2. Runs [`setup/sable-elementor.php`](setup/sable-elementor.php): skips Elementor onboarding,
   disables Elementor Google Fonts, applies the token kit (global colours, fonts, Theme Style),
   and creates an Elementor **Home** page (containers with Heading, Text, Button and Shortcode
   widgets plus the plugin's _Salon enquiry form_ widget), set as the front page.

Both land on `/`.

## Where the files come from

The themes need generated files that are git-ignored (token CSS, `theme.json`, self-hosted fonts,
the Elementor kit), so Blueprints cannot install them straight from the repository with a
`git:directory` resource. Instead:

- [`.github/workflows/wp-release.yml`](../../.github/workflows/wp-release.yml) runs on every push
  to `main` that touches `wordpress/` or `packages/tokens/`: it builds, runs
  `pnpm --filter @salon-demos/wordpress package` (zips in `wordpress/dist/`) and uploads them to
  the rolling **`wp-latest`** pre-release, moving the tag to that commit.
- The Blueprints install from the fixed asset URLs
  `https://github.com/lylaaron98/salon-demos/releases/download/wp-latest/<slug>.zip`
  (`dewlab-block`, `sable-hello-child`, `salon-booking-enquiry`; `dewlab-divi-child` is published
  too but not used, as Divi is not free).
- The demo-content scripts are read from `raw.githubusercontent.com` on `main`.

GitHub release downloads do not send CORS headers; Playground's `url` resources fall back to its
CORS proxy automatically (`fetchWithCorsProxy`), so this works on playground.wordpress.net. If a
self-hosted Playground has no proxy, serve the zips from a CORS-enabled host instead.

**Requirements:** the repository is public, and the workflow has run at least once on `main`
(Actions > _wp-release_ > _Run workflow_ for the first time). Until then the launch links fail
at the install step.

## Editing and checking the Blueprints

- Validate against the official schema (`$schema` in each file). The files were validated with
  the schema from `WordPress/wordpress-playground` (`packages/playground/blueprints/public/blueprint-schema.json`).
- Test a local change before merging: push a branch, then use the raw URL of that branch, or open
  <https://playground.wordpress.net/builder/builder.html> and paste the JSON.
- The setup scripts are plain WordPress PHP and idempotent, so they also run on a normal site:
  `wp eval-file wordpress/playground/setup/dewlab-block.php`. PHPCS and PHPStan cover them.
