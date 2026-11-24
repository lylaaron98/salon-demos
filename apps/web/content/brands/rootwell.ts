import { everyDay, lateWeekdays } from "../hours.ts";
import { parseBrandContent } from "../schema.ts";
import type { Brand } from "../types.ts";
import raw from "./rootwell.json" with { type: "json" };

/** Editable copy lives in the JSON file (managed in the CMS at /keystatic). */
const content = parseBrandContent("rootwell", raw);

// Fictional brand. Names, addresses and numbers are invented demo content.
export const rootwell = {
  id: "rootwell",
  name: "Rootwell",
  shortName: "Rootwell",
  category: "Scalp care and wellness",
  teamNoun: "scalp coaches",
  schemaType: "HealthAndBeautyBusiness",
  priceRange: "$$",
  ...content,
  pricing: {
    ...content.pricing,
    table: {
      variant: "tiers",
      plans: [
        {
          name: "Single",
          price: 98,
          unit: "per visit",
          description: "One signature head spa.",
          features: ["60 minutes", "Scalp camera check", "Home-care tips"],
          cta: { label: "Book a head spa", href: "/rootwell/book?service=head-spa" },
        },
        {
          name: "3-session course",
          price: 268,
          unit: "for 3 visits",
          description: "Monthly visits to reset an oily or irritated scalp.",
          features: ["Save S$26", "Before and after scope photos", "Free rescheduling"],
          featured: true,
          featuredLabel: "Most chosen",
          cta: { label: "Start a course", href: "/rootwell/book?service=head-spa&plan=course" },
        },
        {
          name: "Membership",
          price: 88,
          unit: "a month",
          description: "One head spa a month. Pause or cancel any time.",
          features: ["Members' prices on detox", "Priority evening slots"],
          cta: { label: "Join", href: "/rootwell/book?service=head-spa&plan=membership" },
        },
      ],
    },
  },
  outlets: [
    {
      slug: "bishan",
      area: "Bishan",
      address: "512 Eucalyptus Close, #01-27",
      postalCode: "570512",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.3508, longitude: 103.8485 },
      mrt: "4 min walk from Bishan MRT (NS17 / CC15)",
      hours: lateWeekdays,
      phone: "+65 6301 0000",
      whatsapp: "+65 8301 0000",
    },
    {
      slug: "tampines",
      area: "Tampines",
      address: "8 Ochre Grove, #02-14",
      postalCode: "529808",
      // Approximate neighbourhood centre (the street address is fictional).
      geo: { latitude: 1.354, longitude: 103.9437 },
      mrt: "5 min walk from Tampines MRT (EW2 / DT32)",
      hours: everyDay,
      phone: "+65 6302 0000",
      whatsapp: "+65 8302 0000",
    },
  ],
  offer: {
    id: "first-visit",
    label: "Scalp reset trial",
    services: ["head-spa"],
    price: 38,
  },
} satisfies Brand;
