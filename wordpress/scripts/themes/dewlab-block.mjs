/**
 * Dewlab Skin Studio: block theme (Full Site Editing) assets.
 *
 *   packages/tokens/dist/theme.json + theme.base.json -> theme.json (palette, font sizes, spacing,
 *                                                       layout from tokens; styles from the base;
 *                                                       self-hosted fontFace added here)
 *   packages/tokens/dist/tokens.css (dewlab)          -> assets/build/tokens.css (resolved semantic
 *                                                       variables + Capsize fallback faces)
 *   @fontsource WOFF2 (Latin subset)                  -> assets/build/fonts/*.woff2
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import arial from "@capsizecss/metrics/arial";
import dmSans from "@capsizecss/metrics/dMSans";
import dmSerifDisplay from "@capsizecss/metrics/dMSerifDisplay";
import georgia from "@capsizecss/metrics/georgia";
import { UNICODE_RANGE, copyFonts, fallbackStack, preloads } from "../lib/fonts.mjs";
import { NOTICE, brandVars, inlineRefs, readDist } from "../lib/tokens.mjs";

const BRAND = "dewlab";

/**
 * Faces from design brief 2.5 (DM Serif Display 400; DM Sans 400, 500, 700): about 67 KB in
 * total, two preloaded (body regular and the display face used by the hero H1).
 */
const FONTS = [
  {
    pkg: "@fontsource/dm-sans",
    file: "dm-sans-latin-400-normal.woff2",
    family: "DM Sans",
    slug: "body",
    weight: 400,
    style: "normal",
    display: "swap",
    preload: true,
  },
  {
    pkg: "@fontsource/dm-sans",
    file: "dm-sans-latin-500-normal.woff2",
    family: "DM Sans",
    slug: "body",
    weight: 500,
    style: "normal",
    display: "swap",
  },
  {
    pkg: "@fontsource/dm-sans",
    file: "dm-sans-latin-700-normal.woff2",
    family: "DM Sans",
    slug: "body",
    weight: 700,
    style: "normal",
    display: "swap",
  },
  {
    pkg: "@fontsource/dm-serif-display",
    file: "dm-serif-display-latin-400-normal.woff2",
    family: "DM Serif Display",
    slug: "display",
    weight: 400,
    style: "normal",
    display: "swap",
    preload: true,
  },
];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

/** Deep merge for theme.json: objects merge key by key, anything else (arrays too) is replaced. */
export function mergeThemeJson(target, source) {
  const out = { ...target };
  for (const [key, value] of Object.entries(source)) {
    out[key] = isObject(value) && isObject(out[key]) ? mergeThemeJson(out[key], value) : value;
  }
  return out;
}

/** Insert the metric-matched fallback right after the web font: `"DM Sans", "DM Sans Fallback", ...`. */
const withFallback = (stack, family) => {
  const quoted = `"${family}"`;
  if (!stack.startsWith(quoted))
    throw new Error(`Token font stack "${stack}" does not start with ${quoted}`);
  return `${quoted}, "${family} Fallback"${stack.slice(quoted.length)}`;
};

/**
 * Build `theme.json` and `assets/build/` for `themes/dewlab-block/`.
 *
 * @param {string} theme Theme directory.
 */
export async function buildDewlabBlock(theme) {
  const out = join(theme, "assets", "build");
  await rm(out, { recursive: true, force: true });
  await copyFonts(FONTS, join(out, "fonts"));

  // 1. tokens.css: Dewlab's semantic variables as literals (no primitives, no other brands), so the
  //    theme and the salon-booking-enquiry plugin can read --color-action-bg, --radius-button ...
  const vars = brandVars(await readDist("tokens.css"), BRAND);
  const body = fallbackStack(dmSans, arial);
  const display = fallbackStack(dmSerifDisplay, georgia);
  const declarations = Object.entries(vars)
    .filter(([name]) => !name.startsWith("p-"))
    .map(([name, value]) => `  --${name}: ${inlineRefs(vars, value)};`);
  const tokensCss = [
    `/* ${NOTICE} */`,
    "/* Capsize fallback faces: the swap to DM Sans / DM Serif Display does not shift layout. */",
    body.fontFaces,
    display.fontFaces,
    [
      ":root {",
      `  --font-body: "DM Sans", "DM Sans Fallback";`,
      `  --font-display: "DM Serif Display", "DM Serif Display Fallback";`,
      ...declarations,
      "}",
    ].join("\n"),
    "",
  ].join("\n\n");
  await writeFile(join(out, "tokens.css"), tokensCss);

  // 2. theme.json: token settings (palette, font sizes, spacing, layout) + hand-written styles.
  const tokens = JSON.parse(await readDist("theme.json"));
  const base = JSON.parse(await readFile(join(theme, "theme.base.json"), "utf8"));
  const merged = mergeThemeJson(tokens, base);
  delete merged.title;
  merged.description = `${NOTICE} Sources: packages/tokens/dist/theme.json + theme.base.json.`;

  merged.settings.typography.fontFamilies = tokens.settings.typography.fontFamilies.map((entry) => {
    const faces = FONTS.filter((font) => font.slug === entry.slug);
    if (faces.length === 0) throw new Error(`No self-hosted face for font family "${entry.slug}"`);
    const family = faces[0].family;
    return {
      ...entry,
      fontFamily: withFallback(entry.fontFamily, family),
      fontFace: faces.map((font) => ({
        fontFamily: family,
        fontWeight: String(font.weight),
        fontStyle: font.style,
        fontDisplay: font.display,
        unicodeRange: UNICODE_RANGE,
        src: [`file:./assets/build/fonts/${font.file}`],
      })),
    };
  });

  // Keep a stable key order: $schema, version, description, settings, styles, then the rest.
  const { $schema, version, description, settings, styles, ...rest } = merged;
  await writeFile(
    join(theme, "theme.json"),
    `${JSON.stringify({ $schema, version, description, settings, styles, ...rest }, null, 2)}\n`,
  );

  await mkdir(out, { recursive: true });
  await writeFile(
    join(out, "manifest.json"),
    `${JSON.stringify({ notice: NOTICE, tokens: "tokens.css", preload: preloads(FONTS) }, null, 2)}\n`,
  );
  return out;
}
