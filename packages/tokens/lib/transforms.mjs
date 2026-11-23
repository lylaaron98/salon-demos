import { fontFamilies, fontStack } from "./shared.mjs";

/**
 * Registers the custom transforms and transform groups on a StyleDictionary class.
 * Values are kept exactly as authored (no rem/hex conversions) so the output
 * matches the design brief one-to-one.
 *
 * @param {typeof import("style-dictionary").default} StyleDictionary
 */
export function registerTransforms(StyleDictionary) {
  // Token paths are already kebab-case, so the name is just the path joined with "-":
  // ["p", "aubergine-800"] -> "p-aubergine-800", ["color", "bg", "page"] -> "color-bg-page".
  StyleDictionary.registerTransform({
    name: "orrin/name/path",
    type: "name",
    transform: (token) => token.path.join("-"),
  });

  // [0.2, 0, 0, 1] -> cubic-bezier(0.2, 0, 0, 1)
  StyleDictionary.registerTransform({
    name: "orrin/cubic-bezier/css",
    type: "value",
    filter: (token) =>
      (token.$type ?? token.type) === "cubicBezier" && Array.isArray(token.$value ?? token.value),
    transform: (token) => `cubic-bezier(${(token.$value ?? token.value).join(", ")})`,
  });

  // Font stacks for CSS. The first family is wrapped in a var() hook so apps that
  // self-host fonts (next/font) can point --font-display / --font-body at the real
  // font-face name; without the hook the plain family name is used.
  // "Manrope, system-ui, sans-serif" on font-family.body ->
  //   var(--font-body, "Manrope"), system-ui, sans-serif
  StyleDictionary.registerTransform({
    name: "orrin/font-family/css",
    type: "value",
    filter: (token) => (token.$type ?? token.type) === "fontFamily",
    transform: (token) => {
      const [first, ...rest] = fontFamilies(token.$value ?? token.value);
      const role = token.path.at(-1);
      return [`var(--font-${role}, ${fontStack([first])})`, fontStack(rest)].join(", ");
    },
  });

  // Plain font stack for non-CSS-variable consumers (TS, WordPress, Divi).
  StyleDictionary.registerTransform({
    name: "orrin/font-family/stack",
    type: "value",
    filter: (token) => (token.$type ?? token.type) === "fontFamily",
    transform: (token) => fontStack(token.$value ?? token.value),
  });

  StyleDictionary.registerTransformGroup({
    name: "orrin/css",
    transforms: ["orrin/name/path", "orrin/cubic-bezier/css", "orrin/font-family/css"],
  });

  StyleDictionary.registerTransformGroup({
    name: "orrin/plain",
    transforms: ["orrin/name/path", "orrin/cubic-bezier/css", "orrin/font-family/stack"],
  });
}
