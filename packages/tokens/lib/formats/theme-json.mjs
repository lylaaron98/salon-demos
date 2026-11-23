import { GENERATED_NOTICE, fontFamilies, getToken, tokenValue, value } from "../shared.mjs";
import { DEWLAB_GLOBAL_COLORS, slugify } from "./wp-palette.mjs";

/**
 * WordPress block theme `theme.json` fragment (schema version 3) for one brand:
 * settings.color.palette, settings.typography.fontFamilies/fontSizes and
 * settings.spacing. Merge it into the theme's own theme.json.
 */

const FONT_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];
const SPACE_STEPS = ["1", "2", "3", "4", "5", "6", "8", "10", "12", "16", "20", "24", "32"];

/** @type {import("style-dictionary/types").FormatFn} */
export function themeJsonFormat({ dictionary, options }) {
  const palette = DEWLAB_GLOBAL_COLORS.map(({ name, token }) => ({
    slug: slugify(name),
    name,
    color: value(dictionary, token),
  }));

  const families = ["display", "body"].map((role) => {
    const stack = value(dictionary, `font-family.${role}`);
    return {
      slug: role,
      name: `${role === "display" ? "Display" : "Body"}: ${fontFamilies(stack)[0]}`,
      fontFamily: stack,
    };
  });

  const fontSizes = FONT_SIZES.map((step) => {
    const token = getToken(dictionary, `font-size.${step}`);
    const { mobile, desktop } = token.$extensions["com.orrin.px"];
    return {
      slug: step,
      name: `${step.toUpperCase()} (${mobile}–${desktop} px)`,
      // Already a fluid clamp() from the tokens, so WordPress must not re-fluidise it.
      size: tokenValue(token),
      fluid: false,
    };
  });

  const spacingSizes = SPACE_STEPS.map((step) => ({
    slug: step,
    name: value(dictionary, `space.${step}`),
    size: value(dictionary, `space.${step}`),
  }));

  const themeJson = {
    $schema: "https://schemas.wp.org/trunk/theme.json",
    version: 3,
    title: `${options.brandName} tokens`,
    description: `${GENERATED_NOTICE} Brand: ${options.brand}.`,
    settings: {
      color: {
        defaultPalette: false,
        defaultGradients: false,
        defaultDuotone: false,
        custom: false,
        customGradient: false,
        palette,
      },
      typography: {
        defaultFontSizes: false,
        customFontSize: false,
        fluid: false,
        fontFamilies: families,
        fontSizes,
      },
      spacing: {
        defaultSpacingSizes: false,
        units: ["px", "rem", "%", "vw", "vh"],
        spacingSizes,
      },
      layout: {
        contentSize: value(dictionary, "layout.max-narrow"),
        wideSize: value(dictionary, "layout.max"),
      },
    },
  };
  return JSON.stringify(themeJson, null, 2) + "\n";
}
