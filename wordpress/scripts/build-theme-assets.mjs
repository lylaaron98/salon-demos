/**
 * Builds every WordPress theme's generated assets from `packages/tokens/dist` and @fontsource.
 *
 *   themes/sable-hello-child/assets/build/   Elementor kit, tokens.css, fonts (scripts/themes/sable-hello-child.mjs)
 *   themes/dewlab-block/theme.json           theme.json v3 merged from the token build (scripts/themes/dewlab-block.mjs)
 *   themes/dewlab-block/assets/build/        tokens.css, fonts
 *   themes/dewlab-divi-child/assets/build/   divi-child.css, fonts, Global Colors JSON (scripts/themes/dewlab-divi-child.mjs)
 *
 * Output is git-ignored, rebuilt by `pnpm build` (Turborepo runs the tokens build first because
 * this package depends on it) and shipped by the deploy and release workflows.
 * Nothing here is typed by hand: colours, sizes and radii are read from the token build.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDewlabBlock } from "./themes/dewlab-block.mjs";
import { buildDewlabDivi } from "./themes/dewlab-divi-child.mjs";
import { buildSable } from "./themes/sable-hello-child.mjs";

const themes = join(dirname(fileURLToPath(import.meta.url)), "..", "themes");

for (const [name, build] of [
  ["sable-hello-child", buildSable],
  ["dewlab-block", buildDewlabBlock],
  ["dewlab-divi-child", buildDewlabDivi],
]) {
  const out = await build(join(themes, name));
  console.info(`Theme assets built -> ${out}`);
}
