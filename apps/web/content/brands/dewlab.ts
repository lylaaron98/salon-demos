import { closedMondays, lateWeekdays } from "../hours.ts";
import { parseBrandContent } from "../schema.ts";
import type { Brand } from "../types.ts";
import raw from "./dewlab.json" with { type: "json" };

/** Editable copy lives in the JSON file (managed in the CMS at /keystatic). */
const content = parseBrandContent("dewlab", raw);

// Fictional brand. Names, addresses and numbers are invented demo content.
export const dewlab = {
  id: "dewlab",
  name: "Dewlab Skin Studio",
  shortName: "Dewlab",
  category: "Facials and skin aesthetics",
  teamNoun: "therapists",
  schemaType: "BeautySalon",
  priceRange: "$$",
  ...content,
  pricing: {
    ...content.pricing,
    table: {
      variant: "tiers",
      plans: [
        {
          name: "Single",
          price: 138,
          unit: "per session",
          description: "One Hydra-Glow facial with skin analysis.",
          features: ["75 minutes", "Skin analysis included", "Aftercare notes by email"],
          cta: { label: "Book a single", href: "/dewlab/book?service=hydra-glow-facial" },
        },
        {
          name: "3-session course",
          price: 368,
          unit: "for 3 sessions",
          description: "For visible change over six to eight weeks.",
          features: ["Save S$46", "Progress photos (kept private)", "Free rescheduling"],
          featured: true,
          featuredLabel: "Best value",
          cta: {
            label: "Start a course",
            href: "/dewlab/book?service=hydra-glow-facial&plan=course",
          },
        },
        {
          name: "Membership",
          price: 118,
          unit: "a month",
          description: "One facial every month. Pause or cancel any time.",
          features: ["Members' prices on add-ons", "Priority weekend booking"],
          cta: { label: "Join", href: "/dewlab/book?service=hydra-glow-facial&plan=membership" },
        },
      ],
    },
  },
  outlets: [
    {
      slug: "novena",
      area: "Novena",
      address: "238 Dewpoint Road, #03-11",
      postalCode: "307238",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.3204, longitude: 103.8438 },
      mrt: "2 min walk from Novena MRT (NS20)",
      hours: lateWeekdays,
      phone: "+65 6201 0000",
      whatsapp: "+65 8201 0000",
    },
    {
      slug: "katong",
      area: "Katong",
      address: "41 Porcelain Terrace, #01-02",
      postalCode: "428041",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.3051, longitude: 103.905 },
      mrt: "6 min walk from Marine Parade MRT (TE26)",
      hours: closedMondays,
      phone: "+65 6202 0000",
      whatsapp: "+65 8202 0000",
    },
    {
      slug: "bugis",
      area: "Bugis",
      address: "150 Blushwood Avenue, #02-18",
      postalCode: "188150",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.3009, longitude: 103.8559 },
      mrt: "3 min walk from Bugis MRT (EW12 / DT14)",
      hours: lateWeekdays,
      phone: "+65 6203 0000",
      whatsapp: "+65 8203 0000",
    },
  ],
  offer: {
    id: "first-visit",
    label: "First-visit trial",
    services: ["hydra-glow-facial"],
    price: 48,
  },
} satisfies Brand;
