import { GENERATED_NOTICE, tokenValue, value } from "../shared.mjs";
import { DEWLAB_GLOBAL_COLORS } from "./wp-palette.mjs";

/**
 * Divi child-theme stylesheet for one brand (design brief 3.3): the semantic
 * tokens as CSS custom properties, then body, heading, link and button styles
 * that make Divi's default modules follow them. Enqueue after Divi's own CSS.
 */

/** Token groups emitted as custom properties, by path prefix. */
const EMITTED = [
  "color.",
  "font-family.",
  "font-size.",
  "line-height.",
  "font-weight.",
  "radius.",
  "button.",
  "display.",
  "space.",
  "duration.",
  "ease.",
  "shadow.",
  "layout.max",
  "tap-min",
];

/** @type {import("style-dictionary/types").FormatFn} */
export function diviChildFormat({ dictionary, options }) {
  // Primitives are left out: Divi only needs the resolved semantic layer.
  const vars = dictionary.allTokens
    .filter(
      (t) => t.path[0] !== "p" && EMITTED.some((prefix) => t.path.join(".").startsWith(prefix)),
    )
    .map((t) => `  --${t.name}: ${tokenValue(t)};`)
    .join("\n");

  const globalColors = DEWLAB_GLOBAL_COLORS.map(
    ({ name, token }, i) =>
      ` *   ${String(i + 1).padStart(2, " ")}. ${name.padEnd(20)} ${value(dictionary, token)}  (${token.replaceAll(".", "-")})`,
  ).join("\n");

  const heading = (level, size) => `.et_pb_module h${level},
h${level} {
  font-size: var(--font-size-${size});
  line-height: var(--line-height-${size});
}`;

  return `/**
 * ${options.brandName}: Divi child theme tokens
 * ${GENERATED_NOTICE}
 *
 * Divi Global Colors (add in this order in the Divi colour picker so presets
 * and this stylesheet stay in sync):
${globalColors}
 */

:root {
${vars}
}

body {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-family: var(--font-family-body);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-md);
}

#page-container,
#main-content {
  background-color: var(--color-bg-page);
}

h1,
h2,
h3,
h4,
h5,
h6,
.et_pb_module_header {
  color: var(--color-text-primary);
  font-family: var(--font-family-display);
  font-weight: var(--display-weight);
  letter-spacing: var(--display-letter-spacing);
  padding-bottom: var(--space-3);
}

${heading(1, "4xl")}

${heading(2, "3xl")}

${heading(3, "2xl")}

/* H4 and below switch to the body family for legibility at small sizes. */
h4,
h5,
h6 {
  font-family: var(--font-family-body);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0;
}

${heading(4, "xl")}

${heading(5, "lg")}

${heading(6, "md")}

a {
  color: var(--color-text-accent);
  transition: color var(--duration-fast) var(--ease-standard);
}

a:hover {
  color: var(--color-action-bg-hover);
}

/* Btn / Primary preset baseline. Divi's button icon is turned off. */
body #page-container .et_pb_button,
.et_pb_button {
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  min-height: var(--button-height);
  padding: 14px 28px !important;
  border: 0;
  border-radius: var(--radius-button);
  background-color: var(--color-action-bg);
  color: var(--color-action-text);
  font-family: var(--font-family-body);
  font-size: var(--button-font-size);
  font-weight: var(--button-font-weight);
  letter-spacing: var(--button-letter-spacing);
  line-height: 1.2;
  text-transform: var(--button-text-transform);
  transition: background-color var(--duration-fast) var(--ease-standard);
}

body #page-container .et_pb_button:hover,
.et_pb_button:hover {
  padding: 14px 28px !important;
  border: 0;
  background-color: var(--color-action-bg-hover);
  color: var(--color-action-text);
}

body #page-container .et_pb_button:active,
.et_pb_button:active {
  background-color: var(--color-action-bg-pressed);
}

.et_pb_button::after,
.et_pb_button::before {
  display: none !important;
}

/* Btn / Secondary: add the class "btn-secondary" to a Divi button module. */
body #page-container .et_pb_button.btn-secondary,
.et_pb_button.btn-secondary {
  border: 1.5px solid var(--color-action-secondary-border);
  background-color: transparent;
  color: var(--color-action-secondary-text);
}

body #page-container .et_pb_button.btn-secondary:hover,
.et_pb_button.btn-secondary:hover {
  border: 1.5px solid var(--color-action-secondary-border);
  background-color: var(--color-bg-subtle);
  color: var(--color-action-secondary-text);
}

input:not([type="checkbox"], [type="radio"], [type="submit"]),
select,
textarea {
  border: 1px solid var(--color-border-input);
  border-radius: var(--radius-input);
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  font-size: max(16px, var(--font-size-md));
}

:where(a, button, input, select, textarea, .et_pb_button):focus-visible {
  outline: 2px solid var(--color-focus-ring) !important;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
`;
}
