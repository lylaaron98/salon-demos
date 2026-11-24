import { closedMondays, lateWeekdays } from "../hours.ts";
import { parseBrandContent } from "../schema.ts";
import type { Brand } from "../types.ts";
import raw from "./sable.json" with { type: "json" };

/** Editable copy lives in the JSON file (managed in the CMS at /keystatic). */
const content = parseBrandContent("sable", raw);

// Fictional brand. Names, addresses and numbers are invented demo content.
export const sable = {
  id: "sable",
  name: "Sable & Shear",
  shortName: "Sable & Shear",
  category: "Premium hair atelier",
  teamNoun: "stylists",
  schemaType: "HairSalon",
  priceRange: "$$$",
  ...content,
  pricing: {
    ...content.pricing,
    table: {
      variant: "menu",
      caption: "Sable & Shear services by stylist level",
      tierLabel: "Stylist level",
      tiers: ["Stylist", "Senior", "Creative director"],
      categories: [
        {
          name: "Cut and style",
          rows: [
            { service: "Precision cut", prices: [88, 118, 158] },
            { service: "Wash and blow-dry", prices: [48, 58, 78] },
            { service: "Fringe tidy", prices: [25, 30, 40] },
          ],
        },
        {
          name: "Colour",
          rows: [
            { service: "Root colour", prices: [168, 198, 248], from: true },
            { service: "Gloss and tone", prices: [98, 118, 148] },
            { service: "Hand-painted balayage", prices: [268, 328, 398], from: true },
          ],
        },
      ],
    },
  },
  outlets: [
    {
      slug: "tiong-bahru",
      area: "Tiong Bahru",
      address: "18 Linen Arcade Walk, #01-12",
      postalCode: "160418",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.2847, longitude: 103.827 },
      mrt: "4 min walk from Tiong Bahru MRT (EW17)",
      hours: lateWeekdays,
      phone: "+65 6101 0000",
      whatsapp: "+65 8101 0000",
    },
    {
      slug: "tanjong-pagar",
      area: "Tanjong Pagar",
      address: "72 Shearwater Street, #02-05",
      postalCode: "088472",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.2765, longitude: 103.8458 },
      mrt: "3 min walk from Tanjong Pagar MRT (EW15)",
      hours: lateWeekdays,
      phone: "+65 6102 0000",
      whatsapp: "+65 8102 0000",
    },
    {
      slug: "holland-village",
      area: "Holland Village",
      address: "9 Brassfield Lane, #01-03",
      postalCode: "278909",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.3112, longitude: 103.7958 },
      mrt: "5 min walk from Holland Village MRT (CC21)",
      hours: closedMondays,
      phone: "+65 6103 0000",
      whatsapp: "+65 8103 0000",
    },
  ],
  offer: {
    id: "first-visit",
    label: "First-visit colour offer",
    services: ["root-colour", "hand-painted-balayage"],
    percentOff: 20,
  },
} satisfies Brand;
