/**
 * Dewlab global colour list, in the order of the Divi Global Colors table (design
 * brief 3.3). The block theme palette uses the same names so both builds match.
 */
export const DEWLAB_GLOBAL_COLORS = [
  { name: "Action / Primary", token: "color.action.bg" },
  { name: "Action / Hover", token: "color.action.bg-hover" },
  { name: "Text / Primary", token: "color.text.primary" },
  { name: "Text / Muted", token: "color.text.muted" },
  { name: "BG / Page", token: "color.bg.page" },
  { name: "BG / Surface", token: "color.bg.surface" },
  { name: "BG / Subtle", token: "color.bg.subtle" },
  { name: "BG / Accent (blush)", token: "color.bg.accent" },
  { name: "BG / Inverse", token: "color.bg.inverse" },
  { name: "Border / Input", token: "color.border.input" },
  { name: "Decor / Rose", token: "color.decor-accent" },
  { name: "Status / Error", token: "color.error" },
  { name: "Status / Success", token: "color.success" },
];

/** "BG / Accent (blush)" -> "bg-accent-blush" */
export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
