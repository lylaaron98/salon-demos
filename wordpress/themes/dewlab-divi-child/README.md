# Dewlab Skin Studio: Divi child theme

Divi 4 child theme for the fictional **Dewlab Skin Studio**. **Status: ready, not deployed.** Divi
has no free version, so the live Dewlab demo runs on the block theme
[`dewlab-block`](../dewlab-block/) (same tokens, same design). Everything Divi needs is written,
generated and documented here, so switching costs one licence and one deploy.

## What is generated

`pnpm build` (repo root) runs `wordpress/scripts/build-theme-assets.mjs`
(`scripts/themes/dewlab-divi-child.mjs`) and writes `assets/build/` (git-ignored):

| File                 | Source                                                | Used for                                                                                              |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `divi-child.css`     | `packages/tokens/dist/divi-child.css`                 | Token variables, body/heading/link styles, `Btn / Primary` + `btn-secondary`, form fields, focus ring |
| `fonts.css`          | `@fontsource/dm-sans`, `@fontsource/dm-serif-display` | `@font-face` (Latin subset), Capsize fallbacks, font stacks that use them                             |
| `fonts/*.woff2`      | as above                                              | DM Sans 400/500/700, DM Serif Display 400 (about 67 KB)                                               |
| `global-colors.json` | Global Colors list in `divi-child.css`                | The 13 colours in order, plus a `global_colors` array in Divi export shape                            |
| `manifest.json`      | build script                                          | The two fonts to preload                                                                              |

`functions.php` enqueues the Divi parent stylesheet (only if Divi has not, handle
`divi-style-parent`), then `divi-child.css`, then `fonts.css`; preloads two fonts; dequeues
Divi's Google Fonts handles; and lists DM Sans / DM Serif Display as web-safe fonts
(`et_websafe_fonts`) so the Divi font pickers offer them without a Google request.

## Global Colors mapping

Add these in this order (Divi 4.17+ colour picker > Global Colors). Global Colors are linked, so
changing one updates every module that uses it. Values are generated: check
`assets/build/global-colors.json` after a token change.

| #   | Name                | Token                   | Hex       | Used by                                           |
| --- | ------------------- | ----------------------- | --------- | ------------------------------------------------- |
| 1   | Action / Primary    | `color-action-bg`       | `#A3434F` | Primary buttons, links, focus ring, accent colour |
| 2   | Action / Hover      | `color-action-bg-hover` | `#8E3442` | Button hover/pressed, secondary button border     |
| 3   | Text / Primary      | `color-text-primary`    | `#2E2326` | Body and heading text                             |
| 4   | Text / Muted        | `color-text-muted`      | `#6E5F62` | Captions, therapist body text                     |
| 5   | BG / Page           | `color-bg-page`         | `#FBF5F2` | Site background                                   |
| 6   | BG / Surface        | `color-bg-surface`      | `#FFFFFF` | Cards, form fields, open FAQ rows                 |
| 7   | BG / Subtle         | `color-bg-subtle`       | `#F2D8D2` | `Section / Subtle`, secondary button hover        |
| 8   | BG / Accent (blush) | `color-bg-accent`       | `#E8C4BC` | Promo band, featured pricing table                |
| 9   | BG / Inverse        | `color-bg-inverse`      | `#2E2326` | `Section / Inverse`, footer                       |
| 10  | Border / Input      | `color-border-input`    | `#94858A` | Form field borders, interactive blush cards       |
| 11  | Decor / Rose        | `color-decor-accent`    | `#D27D86` | Illustration only, never text or buttons          |
| 12  | Status / Error      | `color-error`           | `#B42318` | Form errors                                       |
| 13  | Status / Success    | `color-success`         | `#027A48` | Form success                                      |

## Global Presets mapping

Divi Builder > module settings > preset dropdown > _Create New Preset_ > _Assign as default_
where marked. "Global n" refers to the table above.

| Module             | Preset                                  | Settings                                                                                                        | CSS already in `divi-child.css`        |
| ------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Button             | `Btn / Primary` (default)               | Background Global 1, hover Global 2, white text, radius 999, padding 14px 28px, DM Sans 500 16px, icon off      | Yes (`.et_pb_button`, min-height 48px) |
| Button             | `Btn / Secondary`                       | Transparent, 1.5px border Global 2, text Global 2, hover background Global 7; CSS class `btn-secondary`         | Yes (`.btn-secondary`)                 |
| Button             | `Btn / WhatsApp`                        | Background `color-whatsapp-bg`, text `color-whatsapp-text`, radius 999                                          | Variables only                         |
| Blurb              | `Card / Service`                        | Background Global 6, radius 16, shadow `--shadow-sm`, image 4:3 on top, title DM Serif 25px                     | No                                     |
| Blurb              | `Card / Therapist`                      | Image 4:5, radius 16, title DM Sans 600 20px, body Global 4                                                     | No                                     |
| Pricing Tables     | `Pricing / Default`                     | Featured table background Global 8 + 1px Global 10 border, header DM Serif, button `Btn / Primary`              | No                                     |
| Toggle / Accordion | `FAQ / Default`                         | Open background Global 6, closed transparent, 1px bottom border Global 7, title DM Sans 600 18px, icon Global 1 | No (or use `[salon_faq]`)              |
| Testimonial        | `Quote / Default`                       | Background Global 6, radius 16, quote icon off, body DM Serif 22px                                              | No                                     |
| Contact Form       | `Form / Enquiry`                        | Field background white, border 1px Global 10, radius 12, focus border Global 1, button `Btn / Primary`          | Yes (inputs, focus ring)               |
| Text               | `Text / Eyebrow`                        | DM Sans 500 13px, uppercase, letter-spacing 1.5px, colour Global 2 (passes 4.5:1 on blush)                      | No                                     |
| Section            | `Section / Subtle`, `Section / Inverse` | Background Global 7 / Global 9; padding 96 / 64 / 48 px (desktop / tablet / phone)                              | No                                     |

**Theme Customizer** (General Settings): content width 1200px, gutter 2; body 17px (16px tablet
and phone), line height 1.6; header 49px, letter spacing -1px, line height 1.1; header font
DM Serif Display, body font DM Sans; body and header text Global 3; background Global 5; accent
Global 1. Header and footer come from Theme Builder (Customizer header unused).

**Performance** (Theme Options > Performance): Dynamic Module Framework, Dynamic CSS, Dynamic
Icons, Critical CSS, Defer jQuery and jQuery Migrate, Defer Additional Third Party Scripts on;
Google Fonts off (fonts are self-hosted).

**Booking and FAQ:** use a Code module with `[salon_enquiry brand="dewlab"]` and `[salon_faq]`
from the `salon-booking-enquiry` plugin instead of the Divi Contact Form (same validation, CPT
storage, REST endpoints and analytics events as the other builds).

**Known deviation:** Divi's breakpoints are fixed (980 / 767 px); the brief's 768 px is treated as
the phone/tablet boundary and 980 px as tablet (design brief 3.4).

## Layout export placeholder

[`layouts/dewlab-home.placeholder.json`](layouts/dewlab-home.placeholder.json) is a placeholder in
Divi 4's portability shape (`context`, `data`, `presets`, `global_colors`, ...) with a hero section
and the plugin shortcodes. It is **not** a real export and has not been imported into Divi. With a
licence: build the home page in Divi, then **Divi > Theme Options > Portability > Export**
(include Global Presets) and **Divi Library > Export**, and replace the placeholder, also saving
the presets as `layouts/presets.json`. The design brief's Global Colors can be pasted from
`assets/build/global-colors.json` (`global_colors`).

## Switching Dewlab from the block theme to Divi

1. Buy a Divi licence (Elegant Themes, about US$89/yr or $249 lifetime). Install **Divi** in
   `wp-content/themes/Divi/` (keep the folder name, `Template: Divi` depends on it).
2. `pnpm install && pnpm build`, then upload `wordpress/themes/dewlab-divi-child/` (with
   `assets/build/`) to `wp-content/themes/dewlab-divi-child/` (FTP or zip upload).
3. Keep **salon-booking-enquiry** active (Settings > Salon enquiries: brand _Dewlab_).
4. Appearance > Themes > activate **Dewlab Skin Studio (Divi child)**. The block theme's pages
   still exist; their block content renders as plain content until rebuilt in Divi.
5. Add the Global Colors and Presets above (or import the real export once it exists), set the
   Customizer and Performance options, build Theme Builder header/footer and the home page.
6. Switching back is just re-activating **Dewlab Skin Studio** (block theme); nothing is lost.
