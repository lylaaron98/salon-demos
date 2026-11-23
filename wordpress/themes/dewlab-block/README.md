# Dewlab Skin Studio: block theme

Standalone block theme (Full Site Editing) for the fictional **Dewlab Skin Studio** (an Orrin
Collective demo brand). It replaces the Divi build from the original plan on the zero-cost route:
no licence, no page builder, no jQuery and no theme JavaScript.

The booking form and FAQ come from the companion plugin
[`salon-booking-enquiry`](../../plugins/salon-booking-enquiry/) (block and shortcodes).

## What is generated

Design values are never typed by hand. `pnpm build` (repo root) builds `packages/tokens`, then
`wordpress/scripts/build-theme-assets.mjs` (`scripts/themes/dewlab-block.mjs`) writes:

| File (git-ignored)           | Source                                                | Contents                                                                                                   |
| ---------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `theme.json` (v3)            | `packages/tokens/dist/theme.json` + `theme.base.json` | Palette, font sizes, spacing scale and layout from tokens; styles from the base; `fontFace` for every face |
| `assets/build/tokens.css`    | `packages/tokens/dist/tokens.css` (`dewlab` brand)    | Resolved semantic variables (`--color-action-bg`, `--radius-button`, shadows) + Capsize fallback faces     |
| `assets/build/fonts/*.woff2` | `@fontsource/dm-sans`, `@fontsource/dm-serif-display` | DM Sans 400/500/700, DM Serif Display 400, Latin subset, about 67 KB in total                              |
| `assets/build/manifest.json` | build script                                          | The two fonts to preload                                                                                   |

Edit `theme.base.json` for styles (element and block styles, template parts, custom templates);
edit `packages/tokens` for any colour, size or spacing value, then rebuild. The merge is a deep
merge where the base wins and arrays are replaced; font families keep the token stack and gain
the metric-matched fallback (`"DM Sans", "DM Sans Fallback", system-ui, ...`).

Without a build the theme activates but is unstyled, so deploy the built folder.

## Structure

| Path                                              | What                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `templates/home.html`                             | Posts page ("Journal")                                                                 |
| `templates/page-landing.html`                     | Custom template _Landing page (no title, full width)_ for pattern-built pages          |
| `templates/page.html`                             | Default page: title, featured image, content                                           |
| `templates/single.html`                           | Post: category, title, date, image, content, previous/next                             |
| `templates/index.html`, `search.html`, `404.html` | Archives, search results, not found                                                    |
| `parts/header.html`                               | Site title, core Navigation (hamburger overlay below 600 px), _Book now_ button        |
| `parts/footer.html`                               | Four columns on the inverse surface, group lockup, demo disclaimer, mobile booking bar |
| `patterns/*.php`                                  | Sections (category _Dewlab Skin Studio_), see below                                    |
| `assets/css/theme.css`                            | The few rules theme.json cannot express (cards, chips, focus ring, sticky header, bar) |

Header and footer parts are thin wrappers around PHP patterns so links use `home_url()` (works in
sub-directory installs and WordPress Playground, whose URLs carry a `/scope:…/` prefix).

### Patterns

| Pattern                          | Brief | Notes                                                                                      |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------ |
| `dewlab-block/home`              | 5.1   | Whole home page, offered as a starter when creating a page; uses the patterns below        |
| `dewlab-block/hero`              | 4.2   | Image-split, eyebrow, H1, lead, primary + outline CTA, trust row; original SVG artwork     |
| `dewlab-block/first-trial-promo` | 4.5   | Inline band on blush: "Your first signature facial, S$48."                                 |
| `dewlab-block/service-cards`     | 4.3   | Three cards, prices and durations match the plugin catalogue                               |
| `dewlab-block/pricing`           | 4.4   | Tiers: single, 3-session course (featured), membership                                     |
| `dewlab-block/testimonials`      | 4.6   | Three quotes, labelled as demo reviews, no Review schema                                   |
| `dewlab-block/outlets`           | 4.8   | Outlet cards with Book, Call, WhatsApp; read from the plugin catalogue when active         |
| `dewlab-block/faq`               | 4.9   | `[salon_faq]`: native `<details>` accordion matching the plugin's FAQPage JSON-LD          |
| `dewlab-block/booking-cta`       | 4.11  | Closing CTA + `salon-booking-enquiry/enquiry-form` block (`brand: dewlab`), anchor `#book` |

Without the plugin, the form block renders nothing and the theme hides the unregistered
`[salon_faq]` shortcode instead of printing it (`render_block_core/shortcode` filter).

## Setup

1. WordPress 6.5+ (tested on 6.8), PHP 8.1+. Upload `dewlab-block/` (built) to
   `wp-content/themes/` and activate **Dewlab Skin Studio**.
2. Install and activate **salon-booking-enquiry**. In **Settings > Salon enquiries** set the
   site brand to _Dewlab_, the business type to _BeautySalon_ and replace the FAQ lines.
3. **Pages > Add New**: pick _Dewlab home page_ from the starter patterns, set the template to
   _Landing page (no title, full width)_ and publish. Then **Settings > Reading**: _A static
   page_, front page = that page.
4. Site title "Dewlab Skin Studio" (shown by the header and used by the footer pattern).

## Performance

- No jQuery and no theme script. The only front-end JS is core Navigation's overlay module
  (Interactivity API, about 10 KB) and, on pages with the form, the plugin's deferred script.
- Two small stylesheets (`tokens.css`, `theme.css`) carry `path` data so WordPress can inline
  them; core block CSS loads per block (`should_load_separate_core_block_assets`).
- Fonts are self-hosted (theme.json `fontFace`, `font-display: swap`), two are preloaded, and
  Capsize fallbacks (`size-adjust`, `ascent-override`, `descent-override`) avoid layout shift.
- Emoji script and styles, oEmbed host JS, generator, RSD and WLW tags are removed on the front
  end. Hero artwork is a 1.5 KB SVG with `width`/`height` set.

## Accessibility

- Core skip link to `<main>`; header is sticky and reserves its height.
- 2 px focus ring in the action colour (`--color-focus-ring`), white on the inverse footer.
- Buttons are at least 48 px high. Text pairs follow design brief 2.4; eyebrows use the darker
  rosewood (`--color-action-secondary-text`) so they pass 4.5:1 on blush and porcelain, and the
  form sits on a white card so its muted text keeps 4.5:1.
- `prefers-reduced-motion` removes transitions and smooth scrolling.

## Deviations from the design brief

- Mobile breakpoint is core Navigation's 600 px (brief: 1024 px). Below 600 px the header CTA
  moves to a CSS-only bottom bar (WhatsApp, Call, Book now); it is always visible rather than
  appearing after the hero CTA scrolls away, which would need JavaScript.
- No stock photography is bundled (licensing); the hero uses original abstract SVG artwork and
  service cards are text-only. Swap in Unsplash/Pexels images per brief 7.1 when deploying.

## Hooks

| Hook             | Type   | Purpose                                                    |
| ---------------- | ------ | ---------------------------------------------------------- |
| `dewlab_contact` | filter | Name, phone and WhatsApp number used by header/footer/CTAs |
