/**
 * The three fictional studios of the fictional Orrin Collective group.
 * Every name and tagline here is original demo content.
 */
export type Brand = {
  id: "sable" | "dewlab" | "rootwell";
  name: string;
  category: string;
  tagline: string;
};

export const group = {
  name: "Orrin Collective",
  tagline: "Specialists in feeling like yourself.",
} as const;

export const brands: readonly Brand[] = [
  {
    id: "sable",
    name: "Sable & Shear",
    category: "Premium hair atelier",
    tagline: "Cut with intent.",
  },
  {
    id: "dewlab",
    name: "Dewlab Skin Studio",
    category: "Facials and skin aesthetics",
    tagline: "Skin, studied.",
  },
  {
    id: "rootwell",
    name: "Rootwell",
    category: "Scalp care and wellness",
    tagline: "Healthy hair starts at the root.",
  },
];
