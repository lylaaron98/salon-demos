/**
 * Self-hosted WOFF2 fonts (Latin subset from @fontsource) and Capsize metric-matched fallback
 * faces, so swapping to the web font does not shift layout (design brief 2.5).
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { createFontStack } from "@capsizecss/core";

const require = createRequire(import.meta.url);

/** Latin + common punctuation, as in design brief 2.5. */
export const UNICODE_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2212";

/**
 * Copy each face's WOFF2 file into `dir`.
 *
 * @param {Array<{pkg: string, file: string}>} fonts
 * @param {string} dir
 */
export async function copyFonts(fonts, dir) {
  await mkdir(dir, { recursive: true });
  for (const font of fonts) {
    const source = join(dirname(require.resolve(`${font.pkg}/package.json`)), "files", font.file);
    await copyFile(source, join(dir, font.file));
  }
}

/** `@font-face` rule for one face, with `src` relative to the stylesheet. */
export function fontFaceCss(font, prefix = "fonts/") {
  return [
    "@font-face {",
    `  font-family: "${font.family}";`,
    `  font-style: ${font.style};`,
    `  font-weight: ${font.weight};`,
    `  font-display: ${font.display};`,
    `  src: url("${prefix}${font.file}") format("woff2");`,
    `  unicode-range: ${UNICODE_RANGE};`,
    "}",
  ].join("\n");
}

/**
 * Capsize fallback stack for a web font and the local font it falls back to.
 *
 * @returns {{ fontFamily: string, fontFaces: string }} e.g. `"DM Sans", "DM Sans Fallback", Arial`
 */
export function fallbackStack(webMetrics, localMetrics) {
  return createFontStack([webMetrics, localMetrics], { fontFaceFormat: "styleString" });
}

/** Files to preload (max two per page, brief 2.5 rule 4). */
export const preloads = (fonts, prefix = "fonts/") =>
  fonts.filter((f) => f.preload).map((f) => `${prefix}${f.file}`);
