/**
 * Builds every token output with Style Dictionary.
 *
 *   src/primitives.json      raw values (tier 1)
 *   src/semantic.json        semantic tokens, defaulting to the Orrin Collective group theme (tier 2)
 *   src/brands/<brand>.json  brand tier: re-points semantic tokens per brand (tier 3)
 *
 * Outputs (dist/, git-ignored, rebuilt in CI):
 *   tokens.css          :root primitives, group semantic layer, one [data-brand] block per brand
 *   tokens.ts           typed, fully resolved token objects for every theme
 *   elementor-kit.json  Elementor Site Settings (Global Colors + Fonts) for Sable & Shear
 *   theme.json          WordPress block theme settings fragment for Dewlab
 *   divi-child.css      Divi child-theme variables and base styles for Dewlab
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { diviChildFormat } from "./lib/formats/divi-child.mjs";
import { elementorKitFormat } from "./lib/formats/elementor-kit.mjs";
import { themeJsonFormat } from "./lib/formats/theme-json.mjs";
import { BRANDS, GENERATED_NOTICE, GROUP, tokenValue, usesBrandInk } from "./lib/shared.mjs";
import { registerTransforms } from "./lib/transforms.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const src = (file) => join(root, "src", file);
const DIST = join(root, "dist");

const PRIMITIVES = src("primitives.json");
const SEMANTIC = src("semantic.json");

const isPrimitive = (token) => token.filePath.endsWith("primitives.json");

registerTransforms(StyleDictionary);
StyleDictionary.registerFormat({ name: "orrin/elementor-kit", format: elementorKitFormat });
StyleDictionary.registerFormat({ name: "orrin/theme-json", format: themeJsonFormat });
StyleDictionary.registerFormat({ name: "orrin/divi-child", format: diviChildFormat });

/**
 * Platform for one CSS block, using Style Dictionary's built-in css/variables format.
 * Blocks reference variables defined in other blocks of the same tokens.css (brand
 * blocks point at :root primitives), so SD's "filtered out token references" warning
 * is expected here and silenced for these platforms only.
 */
const cssPlatform = (file) => ({
  transformGroup: "orrin/css",
  log: { warnings: "disabled" },
  files: [file],
});

/** One CSS block file definition. */
const cssBlock = (destination, selector, filter, outputReferences) => ({
  destination,
  format: "css/variables",
  filter,
  options: { selector, outputReferences, showFileHeader: false },
});

/** Extra file outputs per brand (WordPress builder targets). */
const BRAND_TARGETS = {
  sable: {
    elementor: {
      transformGroup: "orrin/plain",
      buildPath: `${DIST}/`,
      files: [{ destination: "elementor-kit.json", format: "orrin/elementor-kit" }],
    },
  },
  dewlab: {
    wordpress: {
      transformGroup: "orrin/plain",
      buildPath: `${DIST}/`,
      files: [
        { destination: "theme.json", format: "orrin/theme-json" },
        { destination: "divi-child.css", format: "orrin/divi-child" },
      ],
    },
  },
};

/** Turn a flat token list into a nested object keyed by path. */
function nest(tokens) {
  const out = {};
  for (const token of tokens) {
    let node = out;
    token.path.slice(0, -1).forEach((key) => (node = node[key] ??= {}));
    node[token.path.at(-1)] = tokenValue(token);
  }
  return out;
}

const flatVars = (tokens) => Object.fromEntries(tokens.map((t) => [`--${t.name}`, tokenValue(t)]));

async function formatOne(sd, platform) {
  const [file] = await sd.formatPlatform(platform);
  return String(file.output).trim();
}

async function build() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // Group theme: primitives + semantic defaults.
  const base = new StyleDictionary({
    source: [PRIMITIVES, SEMANTIC],
    platforms: {
      primitives: cssPlatform(cssBlock("primitives.css", ":root", isPrimitive, false)),
      semantic: cssPlatform(
        cssBlock(
          "semantic.css",
          `:root,\n[data-brand="${GROUP.id}"]`,
          (t) => !isPrimitive(t),
          true,
        ),
      ),
      plain: { transformGroup: "orrin/plain" },
    },
  });

  const cssParts = [await formatOne(base, "primitives"), await formatOne(base, "semantic")];
  const basePlain = await base.getPlatformTokens("plain");
  const themes = { [GROUP.id]: basePlain.allTokens.filter((t) => !isPrimitive(t)) };
  const primitives = basePlain.allTokens.filter(isPrimitive);

  // Brands: only the brand file is a "source"; primitives and semantic are "include"d so
  // the brand block holds just the overrides (plus the ink-tinted shadows, which must be
  // re-declared where --brand-ink-rgb changes).
  for (const [brand, meta] of Object.entries(BRANDS)) {
    const sd = new StyleDictionary({
      include: [PRIMITIVES, SEMANTIC],
      source: [src(`brands/${brand}.json`)],
      platforms: {
        css: cssPlatform(
          cssBlock(
            `${brand}.css`,
            `[data-brand="${brand}"]`,
            (t) => t.isSource || usesBrandInk(t),
            true,
          ),
        ),
        plain: { transformGroup: "orrin/plain" },
        ...Object.fromEntries(
          Object.entries(BRAND_TARGETS[brand] ?? {}).map(([name, platform]) => [
            name,
            {
              ...platform,
              files: platform.files.map((f) => ({
                ...f,
                options: { brand, brandName: meta.name },
              })),
            },
          ]),
        ),
      },
    });

    cssParts.push(await formatOne(sd, "css"));
    themes[brand] = (await sd.getPlatformTokens("plain")).allTokens.filter((t) => !isPrimitive(t));
    for (const platform of Object.keys(BRAND_TARGETS[brand] ?? {})) {
      await sd.buildPlatform(platform);
    }
  }

  // Reduced motion: collapse every duration token.
  const durations = primitives
    .filter((t) => t.path[0] === "duration")
    .map((t) => `    --${t.name}: 0.01ms;`)
    .join("\n");
  cssParts.push(`@media (prefers-reduced-motion: reduce) {\n  :root {\n${durations}\n  }\n}`);

  const css = `/**\n * Orrin Collective design tokens\n * ${GENERATED_NOTICE}\n *\n * :root                   primitives (--p-*, scales) and the group theme\n * [data-brand="<brand>"]  brand overrides: ${Object.keys(BRANDS).join(", ")}\n */\n\n${cssParts.join("\n\n")}\n`;
  await writeFile(join(DIST, "tokens.css"), css);

  // TypeScript: resolved values for every theme.
  const themeIds = [GROUP.id, ...Object.keys(BRANDS)];
  const themeNames = {
    [GROUP.id]: GROUP.name,
    ...Object.fromEntries(Object.entries(BRANDS).map(([k, v]) => [k, v.name])),
  };
  const json = (value) => JSON.stringify(value, null, 2);
  const ts = `// ${GENERATED_NOTICE}
/* eslint-disable */

/** Brands with their own [data-brand] block. */
export const brandIds = ${json(Object.keys(BRANDS))} as const;
export type BrandId = (typeof brandIds)[number];

/** Every theme: the group default ("${GROUP.id}", also the :root theme) plus each brand. */
export const themeIds = ${json(themeIds)} as const;
export type ThemeId = (typeof themeIds)[number];

export const themeNames: Record<ThemeId, string> = ${json(themeNames)};

/** Tier 1: raw primitive values. */
export const primitives = ${json(nest(primitives))} as const;

/** Tiers 2 + 3: fully resolved semantic tokens per theme. */
export const themes = ${json(Object.fromEntries(Object.entries(themes).map(([k, v]) => [k, nest(v)])))} as const;
export type SemanticTokens = (typeof themes)[ThemeId];

/** Resolved CSS custom property values per theme, keyed by property name. */
export const cssVars: Record<ThemeId, Record<string, string | number>> = ${json(Object.fromEntries(Object.entries(themes).map(([k, v]) => [k, flatVars(v)])))};
`;
  await writeFile(join(DIST, "tokens.ts"), ts);

  console.info(`Tokens built: ${themeIds.length} themes -> ${DIST}`);
}

await build();
