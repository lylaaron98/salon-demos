# Sable & Shear: Hello Elementor child theme

Child theme for the fictional **Sable & Shear** hair atelier (an Orrin Collective demo brand). It
runs on **free Elementor** and free hosting (InfinityFree): everything that would normally need
Elementor Pro is done in theme PHP or in the companion plugin
[`salon-booking-enquiry`](../../plugins/salon-booking-enquiry/).

| Elementor Pro feature       | Replaced by                                                                      |
| --------------------------- | -------------------------------------------------------------------------------- |
| Theme Builder header/footer | `header.php` / `footer.php` (accessible nav, `<dialog>` drawer, sticky Book bar) |
| Site Settings > Custom CSS  | `assets/css/theme.css` semantic token bridge                                     |
| Custom Fonts                | Self-hosted WOFF2 + `@font-face` generated at build time, two preloads           |
| Kit import with Theme Style | Appearance > Sable & Shear kit (writes the generated kit into Elementor)         |
| Forms, Popups               | `salon-booking-enquiry` plugin (Elementor widget, promo modal)                   |

## What is generated

Design values are never typed by hand. `pnpm build` (repo root) builds `packages/tokens`, then
`wordpress/scripts/build-theme-assets.mjs` writes `assets/build/` (git-ignored):

| File                               | Source                                      | Used for                                  |
| ---------------------------------- | ------------------------------------------- | ----------------------------------------- |
| `tokens.css`                       | `packages/tokens/dist/tokens.css`           | All CSS custom properties, `data-brand`   |
| `fonts.css`, `fonts/*.woff2`       | `@fontsource/manrope`, `cormorant-garamond` | Self-hosted Latin subset, `font-display`  |
| `elementor-kit/site-settings.json` | `packages/tokens/dist/elementor-kit.json`   | Global Colors/Fonts + Theme Style, layout |
| `sable-shear-kit.zip`              | the two JSON files above                    | Elementor > Tools > Import/Export Kit     |
| `manifest.json`                    | build script                                | Which two fonts to preload                |

Fallback faces (`Manrope Fallback`, `Cormorant Garamond Fallback`) use Capsize metrics
(`size-adjust`, `ascent-override`, `descent-override`) so the font swap does not shift layout.
Font budget: about 75 KB for all four files, of which only two are preloaded.

## Setup (all free)

1. **WordPress 6.5+, PHP 8.1+.** Install and activate the **Hello Elementor** theme and the free
   **Elementor** plugin from the WordPress directory.
2. **Build the assets** in the repo: `pnpm install && pnpm build`. Check that
   `wordpress/themes/sable-hello-child/assets/build/` exists.
3. **Upload the theme** to `wp-content/themes/sable-hello-child/` (FTP on InfinityFree, or zip the
   folder and use Appearance > Themes > Add New > Upload). Activate **Sable & Shear**.
4. **Apply the kit:** Appearance > **Sable & Shear kit** > _Apply token kit to Elementor_. This
   writes global colours, global fonts, Theme Style (buttons, links, form fields, images),
   content width 1200 px, widget spacing 16 px and the breakpoints from design brief 3.2 into the
   active Elementor kit, then clears Elementor's CSS cache. Re-run it whenever tokens change.
   - Alternative: Elementor > Tools > **Import/Export Kit** > Import, and upload
     `assets/build/sable-shear-kit.zip`. The zip format is Elementor's own and changes between
     versions; if your version rejects it, use the button above (version-independent).
5. **Elementor settings** (Elementor > Settings > Advanced; free options):
   - _Google Fonts_: **Disable** (the theme also filters `elementor/frontend/print_google_fonts`).
   - _Font-display_: **Swap** (set automatically on theme activation if never set).
   - _Features_: enable **Flexbox Container**, **Optimized DOM Output**, **Improved Asset
     Loading**, **Improved CSS Loading**, **Inline Font Icons** and **Lazy-load background
     images** where your Elementor version still lists them.
6. **Menus:** Appearance > Menus. Assign _Primary navigation_, _Footer: services_ and _Footer:
   legal links_. Until then the header falls back to Services, Pricing, Our team, Outlets, Offers.
7. **Contact details:** Appearance > Customize > _Sable & Shear: contact and booking_. Defaults
   are fictional (`+65 6000 0000`, WhatsApp `6580000000`) and must stay fictional for the demo.
8. **Campaign pages:** set the page template to _Campaign landing (minimal header)_ for logo +
   call + CTA only (design brief 4.1 `minimal`).
9. **Sticky Book bar:** shows below 1024 px once the hero CTA scrolls out of view and hides while
   the footer or an enquiry form is on screen. It watches the first Elementor Button widget in
   the page content; to choose another, give that widget the CSS class `sable-hero-cta`
   (Advanced > CSS Classes, available in free Elementor).

## Performance hardening (`inc/performance.php`)

On the front end only (never in wp-admin or the Elementor editor):

- Emoji detection script and styles removed.
- oEmbed discovery links, host JS and `wp-embed` removed.
- `jquery-migrate` removed from jQuery's dependencies.
- Theme script and allow-listed handles use WordPress' `defer` loading strategy. jQuery is not
  deferred because Elementor prints inline scripts that need it.
- Elementor Google Fonts disabled; self-hosted fonts preloaded (max two).
- Generator, RSD, WLW manifest and shortlink tags removed.

Turn any step off with the `sable_performance_features` filter, e.g.
`add_filter( 'sable_performance_features', fn( $f ) => [ 'jquery_migrate' => false ] + $f );`.

## Accessibility

- "Skip to content" is the first focusable element. It targets `#sable-content`, printed after the header, because Elementor full-width templates have no `#content`.
- Mobile drawer is a native `<dialog>` opened with `showModal()`: focus is trapped, the page
  behind is inert, Esc and scrim taps close it, and focus returns to the menu button
  (`aria-expanded` / `aria-controls`).
- Sub-menus open on click via disclosure buttons, not hover. Current page links carry
  `aria-current="page"` (WordPress core) with a 2 px accent underline.
- Sticky bar is `<nav aria-label="Quick booking">`, is `inert` while hidden, and the body gets
  bottom padding equal to its height. Touch targets are at least 44 × 44 px.
- `prefers-reduced-motion` removes transitions.

## Hooks

| Hook                         | Type   | Purpose                            |
| ---------------------------- | ------ | ---------------------------------- |
| `sable_brand`                | filter | Token brand on `<html data-brand>` |
| `sable_header_variant`       | filter | `solid` or `minimal`               |
| `sable_show_book_bar`        | filter | Print the sticky bar               |
| `sable_footer_outlets`       | filter | Footer outlet list (fictional)     |
| `sable_performance_features` | filter | Toggle each hardening step         |
| `sable_defer_script_handles` | filter | Extra script handles to defer      |

If Elementor Pro is ever installed, its Theme Builder header/footer take over automatically
(`elementor_theme_do_location`).
