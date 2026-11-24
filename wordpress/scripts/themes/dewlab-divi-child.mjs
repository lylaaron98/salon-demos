/**
 * Dewlab Skin Studio: Divi child theme assets (kept ready for when a Divi licence exists).
 *
 *   packages/tokens/dist/divi-child.css -> assets/build/divi-child.css (token variables, body,
 *                                          heading, link, button and form styles)
 *   the Global Colors list in that file -> assets/build/global-colors.json (ordered list plus a
 *                                          `global_colors` array in Divi's portability shape)
 *   @fontsource WOFF2 (Latin subset)    -> assets/build/fonts/*.woff2 + fonts.css (same faces
 *                                          as the block theme, Capsize fallbacks)
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import arial from "@capsizecss/metrics/arial";
import dmSans from "@capsizecss/metrics/dMSans";
import dmSerifDisplay from "@capsizecss/metrics/dMSerifDisplay";
import georgia from "@capsizecss/metrics/georgia";
import { copyFonts, fallbackStack, fontFaceCss, preloads } from "../lib/fonts.mjs";
import { NOTICE, brandVars, readDist } from "../lib/tokens.mjs";
import { DEWLAB_FONTS, withFallback } from "./dewlab-block.mjs";

/**
 * Parse the numbered Global Colors list from the divi-child.css header comment:
 * ` *    1. Action / Primary     #A3434F  (color-action-bg)`.
 */
export function parseGlobalColors(css) {
  const colors = [];
  for (const [, order, name, hex, token] of css.matchAll(
    /^\s*\*\s+(\d+)\.\s+(.+?)\s+(#[0-9A-Fa-f]{6})\s+\(([\w-]+)\)\s*$/gm,
  )) {
    colors.push({ order: Number(order), name, hex: hex.toUpperCase(), token });
  }
  if (colors.length === 0) throw new Error("divi-child.css lists no Global Colors");
  return colors;
}

/**
 * Build `themes/dewlab-divi-child/assets/build/`.
 *
 * @param {string} theme Theme directory.
 */
export async function buildDewlabDivi(theme) {
  const out = join(theme, "assets", "build");
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  const diviCss = await readDist("divi-child.css");
  await writeFile(join(out, "divi-child.css"), diviCss);

  const colors = parseGlobalColors(diviCss);
  await writeFile(
    join(out, "global-colors.json"),
    `${JSON.stringify(
      {
        notice: NOTICE,
        colors,
        // Divi 4.17+ portability export shape: paste into a layout export's "global_colors".
        global_colors: colors.map((c) => [
          `gcid-dewlab-${String(c.order).padStart(2, "0")}`,
          { color: c.hex, active: "yes" },
        ]),
      },
      null,
      2,
    )}\n`,
  );

  // Fonts: @font-face + Capsize fallbacks, then re-point the token font stacks at them. Loaded
  // after divi-child.css so these declarations win.
  await copyFonts(DEWLAB_FONTS, join(out, "fonts"));
  const vars = brandVars(await readDist("tokens.css"), "dewlab");
  const body = fallbackStack(dmSans, arial);
  const display = fallbackStack(dmSerifDisplay, georgia);
  const stack = (value) => value.replace(/^var\(--font-(?:body|display), ("[^"]+")\)/, "$1");
  const css = [
    `/* ${NOTICE} */`,
    "/* Fonts: DM Sans and DM Serif Display (SIL OFL 1.1) via @fontsource, Latin subset. */",
    ...DEWLAB_FONTS.map((font) => fontFaceCss(font)),
    body.fontFaces,
    display.fontFaces,
    [
      ":root {",
      `  --font-family-body: ${withFallback(stack(vars["font-family-body"]), "DM Sans")};`,
      `  --font-family-display: ${withFallback(stack(vars["font-family-display"]), "DM Serif Display")};`,
      "}",
    ].join("\n"),
    "",
  ].join("\n\n");
  await writeFile(join(out, "fonts.css"), css);

  await writeFile(
    join(out, "manifest.json"),
    `${JSON.stringify(
      {
        notice: NOTICE,
        styles: ["divi-child.css", "fonts.css"],
        preload: preloads(DEWLAB_FONTS),
        globalColors: "global-colors.json",
      },
      null,
      2,
    )}\n`,
  );
  return out;
}
