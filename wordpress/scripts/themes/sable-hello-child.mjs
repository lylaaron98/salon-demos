/**
 * Sable & Shear: Hello Elementor child theme assets.
 *
 *   packages/tokens/dist/tokens.css          -> assets/build/tokens.css
 *   packages/tokens/dist/elementor-kit.json  -> assets/build/elementor-kit/site-settings.json
 *                                               (+ Theme Style settings, manifest.json and a
 *                                               ready-to-import sable-shear-kit.zip)
 *   @fontsource WOFF2 (Latin subset)         -> assets/build/fonts/*.woff2 + fonts.css
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import arial from "@capsizecss/metrics/arial";
import cormorantGaramond from "@capsizecss/metrics/cormorantGaramond";
import georgia from "@capsizecss/metrics/georgia";
import manrope from "@capsizecss/metrics/manrope";
import { copyFonts, fallbackStack, fontFaceCss, preloads } from "../lib/fonts.mjs";
import { NOTICE, brandVars, readDist, resolver } from "../lib/tokens.mjs";
import { zip } from "../lib/zip.mjs";

/**
 * Self-hosted faces. `preload` marks the two files the theme preloads (body regular and the
 * hero display weight, brief 2.5 rule 4). Decorative italic uses `optional` (brief 2.5 rule 3).
 */
const FONTS = [
  {
    pkg: "@fontsource/manrope",
    file: "manrope-latin-400-normal.woff2",
    family: "Manrope",
    weight: 400,
    style: "normal",
    display: "swap",
    preload: true,
  },
  {
    pkg: "@fontsource/manrope",
    file: "manrope-latin-600-normal.woff2",
    family: "Manrope",
    weight: 600,
    style: "normal",
    display: "swap",
  },
  {
    pkg: "@fontsource/cormorant-garamond",
    file: "cormorant-garamond-latin-500-normal.woff2",
    family: "Cormorant Garamond",
    weight: 500,
    style: "normal",
    display: "swap",
    preload: true,
  },
  {
    pkg: "@fontsource/cormorant-garamond",
    file: "cormorant-garamond-latin-500-italic.woff2",
    family: "Cormorant Garamond",
    weight: 500,
    style: "italic",
    display: "optional",
  },
];

const px = (value) => Number.parseFloat(value);
const box = (top, right = top, bottom = top, left = right) => ({
  unit: "px",
  top: String(top),
  right: String(right),
  bottom: String(bottom),
  left: String(left),
  isLinked: top === right && right === bottom && bottom === left,
});

/**
 * Elementor Site Settings > Theme Style, Layout and Breakpoints (design brief 3.2), layered on top
 * of the generated Global Colors and Global Fonts. Values reference the globals (`__globals__`)
 * wherever Elementor allows it, so changing a global colour updates every style that uses it.
 */
function themeStyle(kit, token) {
  const colorId = (title) => {
    const found = [...kit.settings.system_colors, ...kit.settings.custom_colors].find(
      (c) => c.title === title,
    );
    if (!found) throw new Error(`Kit has no colour "${title}"`);
    return `globals/colors?id=${found._id}`;
  };
  const fontId = (title) => {
    const found = [...kit.settings.system_typography, ...kit.settings.custom_typography].find(
      (t) => t.title === title,
    );
    if (!found) throw new Error(`Kit has no typography "${title}"`);
    return `globals/typography?id=${found._id}`;
  };

  const radius = px(token("radius-button"));
  const inputRadius = px(token("radius-input"));
  const space = (step) => px(token(`space-${step}`));

  return {
    // Layout
    container_width: { unit: "px", size: px(token("layout-max")), sizes: [] },
    space_between_widgets: {
      column: String(space(4)),
      row: String(space(4)),
      isLinked: true,
      unit: "px",
      size: space(4),
    },
    page_title_selector: "h1.entry-title",
    // Breakpoints: Mobile 767, Tablet 1024, Laptop 1366 on; Mobile Extra and Widescreen off.
    viewport_mobile: px(token("breakpoint-md")) - 1,
    viewport_md: px(token("breakpoint-md")),
    viewport_tablet: px(token("breakpoint-lg")),
    viewport_lg: px(token("breakpoint-lg")) + 1,
    viewport_laptop: 1366,
    active_breakpoints: ["viewport_mobile", "viewport_tablet", "viewport_laptop"],
    // Body
    body_background_background: "classic",
    // Buttons
    button_text_color: token("color-action-text"),
    button_hover_text_color: token("color-action-text"),
    button_border_radius: box(radius),
    button_padding: box(space(4), space(6)),
    // Form fields
    form_field_text_color: token("color-text-primary"),
    form_field_background_color: token("color-bg-surface"),
    form_field_border_border: "solid",
    form_field_border_width: box(1),
    form_field_border_radius: box(inputRadius),
    form_field_padding: box(space(3), space(4)),
    form_field_focus_border_border: "solid",
    form_field_focus_border_width: box(2),
    // Images
    image_border_radius: box(radius),
    __globals__: {
      body_background_color: colorId("BG / Page"),
      body_color: colorId("Text / Primary"),
      body_typography_typography: fontId("Text"),
      link_normal_color: colorId("Text / Accent"),
      link_hover_color: colorId("Action / Primary"),
      h1_typography_typography: fontId("Primary"),
      h2_typography_typography: fontId("Secondary"),
      h3_typography_typography: fontId("H3"),
      h4_typography_typography: fontId("H4"),
      h5_typography_typography: fontId("H4"),
      h6_typography_typography: fontId("Small"),
      button_typography_typography: fontId("Accent"),
      button_background_color: colorId("Action / Primary"),
      button_hover_background_color: colorId("Action / Hover"),
      form_label_typography_typography: fontId("Small"),
      form_label_color: colorId("Text / Primary"),
      form_field_typography_typography: fontId("Text"),
      form_field_border_color: colorId("Border / Input"),
      form_field_focus_border_color: colorId("Action / Primary"),
    },
  };
}

async function buildFonts(out) {
  await copyFonts(FONTS, join(out, "fonts"));

  // Metric-matched fallbacks (Capsize) so the swap to the web font causes no layout shift.
  const body = fallbackStack(manrope, arial);
  const display = fallbackStack(cormorantGaramond, georgia);

  const css = [
    `/* ${NOTICE} */`,
    "/* Fonts: Manrope and Cormorant Garamond (SIL OFL 1.1) via @fontsource, Latin subset. */",
    ...FONTS.map((font) => fontFaceCss(font)),
    body.fontFaces,
    display.fontFaces,
    ":root {",
    `  --font-body: ${body.fontFamily};`,
    `  --font-display: ${display.fontFamily};`,
    "}",
    "",
  ].join("\n\n");
  await writeFile(join(out, "fonts.css"), css);
  return preloads(FONTS);
}

async function buildKit(out, tokensCss) {
  const kit = JSON.parse(await readDist("elementor-kit.json"));
  const token = resolver(brandVars(tokensCss, "sable"));

  const siteSettings = {
    content: kit.content ?? [],
    settings: { ...kit.settings, ...themeStyle(kit, token) },
    metadata: { ...kit.metadata, notice: NOTICE },
  };

  const manifest = {
    name: "sable-shear",
    title: "Sable & Shear (Orrin Collective demo)",
    description:
      "Global colours, global fonts and Theme Style for the fictional Sable & Shear salon, generated from @salon-demos/tokens.",
    author: "Orrin Collective demo",
    version: "2.0",
    elementor_version: "3.25.0",
    created: "2026-01-01 00:00:00",
    thumbnail: false,
    site: "https://example.com",
    "site-settings": {
      theme_style: true,
      global_colors: true,
      global_typography: true,
      general_settings: true,
      experiments: false,
    },
    plugins: [],
  };

  const dir = join(out, "elementor-kit");
  await mkdir(dir, { recursive: true });
  const settingsJson = `${JSON.stringify(siteSettings, null, 2)}\n`;
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  await writeFile(join(dir, "site-settings.json"), settingsJson);
  await writeFile(join(dir, "manifest.json"), manifestJson);
  await writeFile(
    join(out, "sable-shear-kit.zip"),
    zip([
      { name: "manifest.json", data: Buffer.from(manifestJson) },
      { name: "site-settings.json", data: Buffer.from(settingsJson) },
    ]),
  );
}

/**
 * Build `themes/sable-hello-child/assets/build/`.
 *
 * @param {string} theme Theme directory.
 */
export async function buildSable(theme) {
  const out = join(theme, "assets", "build");
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  const tokensCss = await readDist("tokens.css");
  await writeFile(join(out, "tokens.css"), tokensCss);
  const preload = await buildFonts(out);
  await buildKit(out, tokensCss);
  await writeFile(
    join(out, "manifest.json"),
    `${JSON.stringify({ notice: NOTICE, tokens: "tokens.css", fonts: "fonts.css", preload, kit: "elementor-kit/site-settings.json" }, null, 2)}\n`,
  );
  return out;
}
