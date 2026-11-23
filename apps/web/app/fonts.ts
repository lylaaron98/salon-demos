import {
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Manrope,
  Outfit,
  Source_Sans_3,
} from "next/font/google";

/**
 * Self-hosted brand fonts (next/font downloads them at build time; no runtime
 * requests to Google). Each font exposes a CSS variable; globals.css and the
 * token preview map those onto the --font-display / --font-body hooks that
 * tokens.css reads.
 */

/** Group font, used on every page. */
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-manrope",
});

// Brand fonts are not preloaded: they are only needed where a brand is rendered.
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-cormorant",
});

export const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
  variable: "--font-dm-serif-display",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-dm-sans",
});

export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-outfit",
});

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: false,
  variable: "--font-source-sans",
});

/** Class names that define every brand font variable. */
export const brandFontVariables = [cormorant, dmSerifDisplay, dmSans, outfit, sourceSans]
  .map((font) => font.variable)
  .join(" ");
