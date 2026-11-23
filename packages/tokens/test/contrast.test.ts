import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { themeIds, themes, type ThemeId } from "../dist/tokens.ts";
import { contrastRatio } from "../contrast.ts";

/** WCAG 2.2 AA thresholds. */
const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

type Colors = (typeof themes)[ThemeId]["color"];
type Pair = { label: string; fg: (c: Colors) => string; bg: (c: Colors) => string };

/** Text pairs every theme must pass at 4.5:1 (normal-size text). */
const TEXT_PAIRS: Pair[] = [
  { label: "body text on page", fg: (c) => c.text.primary, bg: (c) => c.bg.page },
  { label: "body text on surface", fg: (c) => c.text.primary, bg: (c) => c.bg.surface },
  { label: "body text on subtle", fg: (c) => c.text.primary, bg: (c) => c.bg.subtle },
  { label: "muted text on page", fg: (c) => c.text.muted, bg: (c) => c.bg.page },
  { label: "muted text on surface", fg: (c) => c.text.muted, bg: (c) => c.bg.surface },
  { label: "accent text on page", fg: (c) => c.text.accent, bg: (c) => c.bg.page },
  { label: "on-accent text on accent", fg: (c) => c.text["on-accent"], bg: (c) => c.bg.accent },
  { label: "inverse text on inverse", fg: (c) => c.text.inverse, bg: (c) => c.bg.inverse },
  { label: "primary button", fg: (c) => c.action.text, bg: (c) => c.action.bg },
  { label: "primary button (hover)", fg: (c) => c.action.text, bg: (c) => c.action["bg-hover"] },
  {
    label: "primary button (pressed)",
    fg: (c) => c.action.text,
    bg: (c) => c.action["bg-pressed"],
  },
  {
    label: "outline button on page",
    fg: (c) => c.action["secondary-text"],
    bg: (c) => c.bg.page,
  },
  {
    label: "outline button on surface",
    fg: (c) => c.action["secondary-text"],
    bg: (c) => c.bg.surface,
  },
  { label: "error text on page", fg: (c) => c.error, bg: (c) => c.bg.page },
  { label: "success text on page", fg: (c) => c.success, bg: (c) => c.bg.page },
  { label: "WhatsApp button", fg: (c) => c.whatsapp.text, bg: (c) => c.whatsapp.bg },
  { label: "call button", fg: (c) => c.call.text, bg: (c) => c.call.bg },
];

/** Non-text UI pairs at 3:1 (input borders, focus indicators). */
const NON_TEXT_PAIRS: Pair[] = [
  { label: "input border on surface", fg: (c) => c.border.input, bg: (c) => c.bg.surface },
  { label: "focus ring on page", fg: (c) => c["focus-ring"], bg: (c) => c.bg.page },
  {
    label: "inverse focus ring on action",
    fg: (c) => c["focus-ring-inverse"],
    bg: (c) => c.action.bg,
  },
];

function check(theme: ThemeId, pairs: Pair[], minimum: number) {
  const colors = themes[theme].color;
  for (const { label, fg, bg } of pairs) {
    it(`${label} >= ${minimum}:1`, () => {
      const [f, b] = [fg(colors), bg(colors)];
      const ratio = contrastRatio(f, b);
      assert.ok(
        ratio >= minimum,
        `${theme}: ${label} ${f} on ${b} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`,
      );
    });
  }
}

for (const theme of themeIds) {
  describe(`${theme}: WCAG AA text contrast`, () => check(theme, TEXT_PAIRS, AA_TEXT));
  describe(`${theme}: WCAG AA non-text contrast`, () => check(theme, NON_TEXT_PAIRS, AA_NON_TEXT));
}

describe("contrastRatio", () => {
  it("matches known reference values", () => {
    assert.equal(contrastRatio("#000000", "#FFFFFF").toFixed(2), "21.00");
    assert.equal(contrastRatio("#FFFFFF", "#FFFFFF").toFixed(2), "1.00");
  });

  it("matches the design brief's published ratios", () => {
    // Spot checks against design brief 2.4 (rounded to 2 dp there).
    assert.equal(contrastRatio("#FFFFFF", "#A3434F").toFixed(2), "6.05");
    assert.equal(contrastRatio("#FFFFFF", "#2F5D50").toFixed(2), "7.49");
    assert.equal(contrastRatio("#2A2024", "#F7F3EE").toFixed(2), "14.29");
  });

  it("flags the pairs the brief rejected", () => {
    // Brass as text on linen (2.80) and white on rose (2.99) must fail AA.
    assert.ok(contrastRatio("#B08D57", "#F7F3EE") < AA_TEXT);
    assert.ok(contrastRatio("#FFFFFF", "#D27D86") < AA_TEXT);
  });
});
