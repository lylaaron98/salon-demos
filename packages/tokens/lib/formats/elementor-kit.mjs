import { createHash } from "node:crypto";
import { GENERATED_NOTICE, fontFamilies, pxSizes, value } from "../shared.mjs";

/**
 * Elementor Site Settings (Global Colors + Global Fonts) for one brand, in the shape
 * of the `site-settings.json` inside an Elementor kit export. Import with
 * Elementor > Tools > Import/Export Kit, or apply from the child theme.
 * Mapping follows design brief section 3.2.
 */

/** Elementor custom ids are 7 lowercase alphanumerics; derive them from the token path so they stay stable. */
const elementorId = (seed) => createHash("sha1").update(seed).digest("hex").slice(0, 7);

const px = (size) => ({ unit: "px", size, sizes: [] });
const em = (size) => ({ unit: "em", size, sizes: [] });

const SYSTEM_COLORS = [
  { _id: "primary", title: "Action / Primary", token: "color.action.bg" },
  { _id: "secondary", title: "Action / Hover", token: "color.action.bg-hover" },
  { _id: "text", title: "Text / Primary", token: "color.text.primary" },
  { _id: "accent", title: "Text / Accent", token: "color.text.accent" },
];

const CUSTOM_COLORS = [
  { title: "Text / Muted", token: "color.text.muted" },
  { title: "Text / Inverse", token: "color.text.inverse" },
  { title: "BG / Page", token: "color.bg.page" },
  { title: "BG / Surface", token: "color.bg.surface" },
  { title: "BG / Subtle", token: "color.bg.subtle" },
  { title: "BG / Inverse", token: "color.bg.inverse" },
  { title: "Decor / Brass", token: "color.decor-accent" },
  { title: "Border / Input", token: "color.border.input" },
  { title: "Border / Subtle", token: "color.border.subtle" },
  { title: "Status / Error", token: "color.error" },
  { title: "Status / Success", token: "color.success" },
];

/**
 * family: "display" | "body"; weight: token path; size: font-size step.
 * `fixed` pins every breakpoint to the mobile size (the brief sets the accent style to 14 px everywhere).
 */
const SYSTEM_TYPOGRAPHY = [
  { _id: "primary", title: "Primary", family: "display", weight: "display.weight", size: "4xl" },
  {
    _id: "secondary",
    title: "Secondary",
    family: "display",
    weight: "display.weight",
    size: "3xl",
  },
  { _id: "text", title: "Text", family: "body", weight: "font-weight.regular", size: "md" },
  {
    _id: "accent",
    title: "Accent",
    family: "body",
    weight: "button.font-weight",
    size: "sm",
    fixed: true,
    lineHeight: 1,
    caps: true,
  },
];

const CUSTOM_TYPOGRAPHY = [
  { title: "H3", family: "display", weight: "display.weight", size: "2xl" },
  { title: "H4", family: "body", weight: "font-weight.semibold", size: "xl" },
  { title: "Small", family: "body", weight: "font-weight.regular", size: "sm" },
];

function typography(dictionary, spec, id) {
  const sizes = pxSizes(dictionary, `font-size.${spec.size}`);
  const [desktop, tablet, mobile] = spec.fixed
    ? [sizes.mobile, sizes.mobile, sizes.mobile]
    : [sizes.desktop, sizes.tablet ?? sizes.mobile, sizes.mobile];
  const familyStack = value(dictionary, `font-family.${spec.family}`);
  const entry = {
    _id: id,
    title: spec.title,
    typography_typography: "custom",
    // Elementor wants the bare family name; the fallback stack comes from the theme CSS.
    typography_font_family: fontFamilies(familyStack)[0],
    typography_font_weight: String(value(dictionary, spec.weight)),
    typography_font_size: px(desktop),
    typography_font_size_tablet: px(tablet),
    typography_font_size_mobile: px(mobile),
    typography_line_height: em(spec.lineHeight ?? value(dictionary, `line-height.${spec.size}`)),
  };
  if (spec.caps) {
    const transform = value(dictionary, "button.text-transform");
    // letter-spacing is authored in em; Elementor needs px at the rendered size (0.14em * 14px = 2px).
    const spacingEm = parseFloat(value(dictionary, "button.letter-spacing"));
    entry.typography_text_transform = transform;
    entry.typography_letter_spacing = px(Math.round(spacingEm * mobile * 10) / 10);
  }
  return entry;
}

/** @type {import("style-dictionary/types").FormatFn} */
export function elementorKitFormat({ dictionary, options }) {
  const brand = options.brand;
  const color = (spec, id) => ({
    _id: id,
    title: spec.title,
    color: value(dictionary, spec.token),
  });

  const kit = {
    content: [],
    settings: {
      system_colors: SYSTEM_COLORS.map((spec) => color(spec, spec._id)),
      custom_colors: CUSTOM_COLORS.map((spec) =>
        color(spec, elementorId(`${brand}:${spec.token}`)),
      ),
      system_typography: SYSTEM_TYPOGRAPHY.map((spec) => typography(dictionary, spec, spec._id)),
      custom_typography: CUSTOM_TYPOGRAPHY.map((spec) =>
        typography(dictionary, spec, elementorId(`${brand}:type:${spec.title}`)),
      ),
    },
    metadata: {
      generator: "@salon-demos/tokens",
      notice: GENERATED_NOTICE,
      brand,
      brandName: options.brandName,
    },
  };
  return JSON.stringify(kit, null, 2) + "\n";
}
