import { closedMondays, lateWeekdays } from "../hours";
import type { Brand } from "../types";

// Fictional brand. Names, addresses and numbers are invented demo content.
export const dewlab = {
  id: "dewlab",
  name: "Dewlab Skin Studio",
  shortName: "Dewlab",
  category: "Facials and skin aesthetics",
  tagline: "Skin, studied.",
  description:
    "Dewlab Skin Studio is a fictional Singapore skin studio: hydrating facials, peels and LED, always after a skin analysis. No packages pushed. Portfolio demo.",
  primaryCta: "Book my first facial",
  teamNoun: "therapists",
  hero: {
    eyebrow: "Skin studio · Singapore",
    title: "Skin, studied.",
    lead: "We analyse first, then recommend. Evidence-led facials with a first trial at S$48 and no packages pushed.",
    secondaryCta: "See prices",
    trust: ["4.9 ★ from 900+ reviews (demo)", "No hard-selling", "Skin analysis included"],
  },
  contact: { phone: "+65 6200 0000", whatsapp: "+65 8200 0000" },
  promo: {
    eyebrow: "First trial",
    title: "Your first signature facial, S$48.",
    body: "Usual price S$138. Includes a skin analysis. One trial per person. Demo offer.",
    cta: "Claim the trial",
  },
  services: [
    {
      slug: "hydra-glow-facial",
      title: "Hydra-Glow signature facial",
      category: "Facials",
      summary: "Deep cleanse, gentle exfoliation and layered hydration for skin that looks rested.",
      durationMin: 75,
      priceFrom: 138,
      priceVaries: true,
      badge: "Most booked",
      featured: true,
    },
    {
      slug: "skin-analysis",
      title: "Skin analysis",
      category: "Consultation",
      summary: "Twenty minutes under the scope with a therapist, then a plain-English plan.",
      durationMin: 20,
      priceFrom: 0,
      priceVaries: false,
    },
    {
      slug: "gentle-peel",
      title: "Gentle brightening peel",
      category: "Peels",
      summary: "A low-downtime peel for uneven tone, chosen after your skin analysis.",
      durationMin: 45,
      priceFrom: 158,
      priceVaries: true,
    },
    {
      slug: "led-calm",
      title: "LED calm therapy",
      category: "Light therapy",
      summary: "Red and near-infrared light for redness and recovery. Pairs with any facial.",
      durationMin: 30,
      priceFrom: 68,
      priceVaries: false,
    },
  ],
  pricing: {
    title: "Signature facial packages",
    intro: "Start with one. Courses and membership are there if you want them, never required.",
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
  whyUs: [
    {
      title: "Analysis before advice",
      body: "Every first visit starts with a skin analysis, so recommendations are based on your skin, not a script.",
    },
    {
      title: "No packages pushed",
      body: "Our therapists are not paid commission. If one facial is all you need, that is all we book.",
    },
    {
      title: "Ingredients explained",
      body: "We tell you what goes on your skin and why, in plain English.",
    },
  ],
  team: [
    {
      slug: "priya-nair",
      name: "Priya Nair",
      role: "Lead therapist",
      specialities: ["Sensitive skin", "Peels"],
      languages: ["English", "தமிழ்"],
      outlet: "Novena",
    },
    {
      slug: "joanne-koh",
      name: "Joanne Koh",
      role: "Senior therapist",
      specialities: ["Hydration", "LED"],
      languages: ["English", "中文"],
      outlet: "Katong",
    },
    {
      slug: "siti-rahman",
      name: "Siti Rahman",
      role: "Senior therapist",
      specialities: ["Acne-prone skin", "Extractions"],
      languages: ["English", "Bahasa Melayu"],
      outlet: "Bugis",
    },
    {
      slug: "grace-lee",
      name: "Grace Lee",
      role: "Therapist",
      specialities: ["Facials", "Brow shaping"],
      languages: ["English", "中文"],
      outlet: "Novena",
    },
  ],
  testimonials: [
    {
      quote:
        "No upselling at all. They explained what my skin needed and, just as usefully, what it did not.",
      name: "Nadia R.",
      service: "Hydra-Glow signature facial",
      rating: 5,
    },
    {
      quote:
        "The analysis showed my redness was barrier damage, not acne. Changed how I shop for skincare.",
      name: "Wen Y.",
      service: "Skin analysis",
      rating: 5,
    },
    {
      quote: "Calm room, gentle hands, and I left with notes I could actually follow at home.",
      name: "Aisha M.",
      service: "LED calm therapy",
      rating: 5,
    },
  ],
  outlets: [
    {
      slug: "novena",
      area: "Novena",
      address: "238 Dewpoint Road, #03-11",
      postalCode: "307238",
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
      mrt: "3 min walk from Bugis MRT (EW12 / DT14)",
      hours: lateWeekdays,
      phone: "+65 6203 0000",
      whatsapp: "+65 8203 0000",
    },
  ],
  faqs: [
    {
      question: "What happens at my first visit?",
      answer:
        "A 20-minute skin analysis with a therapist, then your facial. We explain what we found and suggest a plan. You decide.",
    },
    {
      question: "Is there any downtime?",
      answer:
        "The Hydra-Glow facial and LED have none. A gentle peel can leave skin pink for a few hours; we will tell you before we start.",
    },
    {
      question: "Will I be asked to buy a package?",
      answer:
        "No. Therapists earn no commission, and a single session is always an option at the listed price.",
    },
    {
      question: "Can I come if I am pregnant?",
      answer:
        "Yes, for selected facials. Tell us when you book and we will adapt the products and skip peels and LED.",
    },
    {
      question: "Do prices include GST?",
      answer: "Yes. Every price shown includes 9% GST.",
    },
  ],
  closing: {
    title: "Your skin, studied properly.",
    body: "Book your first facial with a skin analysis included, or ask a therapist on WhatsApp.",
  },
  footer: {
    blurb: "A skin studio that analyses first and recommends second. A fictional demo brand.",
    hours: ["Mon–Fri 10 am–9 pm", "Sat 9 am–7 pm", "Sun 10 am–6 pm"],
  },
  offer: {
    id: "first-visit",
    label: "First-visit trial",
    services: ["hydra-glow-facial"],
    price: 48,
  },
} satisfies Brand;
