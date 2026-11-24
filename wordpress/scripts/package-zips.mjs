/**
 * Packages each built theme and plugin as an installable zip in `wordpress/dist/` (git-ignored):
 *
 *   sable-hello-child.zip  dewlab-block.zip  dewlab-divi-child.zip  salon-booking-enquiry.zip
 *
 * Each zip has the slug as its top-level folder, as WordPress and Playground expect. Run after
 * `pnpm build` (the themes need their generated assets); the wp-release workflow attaches the
 * zips to the rolling `wp-latest` GitHub release that the Playground blueprints install from.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { zip } from "./lib/zip.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "dist");

/** Packages and the generated file each one must contain (fail fast on an unbuilt theme). */
const PACKAGES = [
  { dir: "themes/sable-hello-child", requires: "assets/build/tokens.css" },
  { dir: "themes/dewlab-block", requires: "theme.json" },
  { dir: "themes/dewlab-divi-child", requires: "assets/build/divi-child.css" },
  { dir: "plugins/salon-booking-enquiry", requires: "salon-booking-enquiry.php" },
];

/** Development-only files that never ship. */
const EXCLUDE = new Set([".DS_Store", "node_modules", "theme.base.json"]);

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (EXCLUDE.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(path)));
    else if (entry.isFile()) out.push(path);
  }
  return out.sort();
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const { dir, requires } of PACKAGES) {
  const source = join(root, dir);
  if (!existsSync(join(source, requires))) {
    throw new Error(`${dir}/${requires} is missing. Run "pnpm build" first.`);
  }
  const slug = dir.split("/").at(-1);
  const entries = [];
  for (const path of await files(source)) {
    const name = `${slug}/${relative(source, path).split(sep).join("/")}`;
    entries.push({ name, data: await readFile(path) });
  }
  const archive = zip(entries, { deflate: true });
  await writeFile(join(OUT, `${slug}.zip`), archive);
  console.info(`${slug}.zip  ${entries.length} files  ${(archive.length / 1024).toFixed(0)} KB`);
}
