import { closedMondays, lateWeekdays } from "../hours";
import type { Brand } from "../types";

// Fictional brand. Names, addresses and numbers are invented demo content.
export const sable = {
  id: "sable",
  name: "Sable & Shear",
  shortName: "Sable & Shear",
  category: "Premium hair atelier",
  tagline: "Cut with intent.",
  description:
    "Sable & Shear is a fictional hair atelier in Singapore: precision cuts, considered colour and balayage from senior stylists. Portfolio demo.",
  primaryCta: "Book a stylist",
  teamNoun: "stylists",
  hero: {
    eyebrow: "Hair atelier · Singapore",
    title: "Cut with intent.",
    lead: "Precision cuts and considered colour from stylists who listen first. Seniority-tiered, fixed prices. Your colour, considered.",
    secondaryCta: "See prices",
    trust: ["4.9 ★ from 1,200+ reviews (demo)", "No hard-selling", "3 outlets"],
  },
  contact: { phone: "+65 6100 0000", whatsapp: "+65 8100 0000" },
  promo: {
    eyebrow: "First visit",
    title: "20% off colour services on your first visit.",
    body: "New clients only, any stylist level, until 31 January. Demo offer.",
    cta: "See offer",
  },
  services: [
    {
      slug: "precision-cut",
      title: "Precision cut",
      category: "Cut and style",
      summary: "Consultation, wash, cut and finish, shaped around how you wear your hair.",
      durationMin: 60,
      priceFrom: 88,
      priceVaries: true,
    },
    {
      slug: "root-colour",
      title: "Root colour",
      category: "Colour",
      summary: "Seamless regrowth cover, matched to your existing shade.",
      durationMin: 90,
      priceFrom: 168,
      priceVaries: true,
    },
    {
      slug: "hand-painted-balayage",
      title: "Hand-painted balayage",
      category: "Colour",
      summary: "Soft, lived-in colour painted freehand for a slow, graceful grow-out.",
      durationMin: 180,
      priceFrom: 268,
      priceVaries: true,
      badge: "Most booked",
      featured: true,
    },
    {
      slug: "bridal-trial",
      title: "Bridal hair trial",
      category: "Occasion",
      summary: "A full rehearsal of your wedding-day style, with photos to take home.",
      durationMin: 90,
      priceFrom: 148,
      priceVaries: false,
    },
  ],
  pricing: {
    title: "Pricing by stylist level",
    intro: "You choose the level. Every stylist trains in-house; the price reflects experience.",
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
  whyUs: [
    {
      title: "Seniority-tiered pricing",
      body: "Choose your stylist's level up front. The price on the menu is the price you pay.",
    },
    {
      title: "Consult first",
      body: "Every appointment starts with ten minutes of listening before any scissors come out.",
    },
    {
      title: "Considered products",
      body: "Professional colour and bond care chosen for Singapore's humidity, never pushed at the till.",
    },
  ],
  team: [
    {
      slug: "elena-tan",
      name: "Elena Tan",
      role: "Creative director",
      specialities: ["Balayage", "Bridal"],
      languages: ["English", "中文"],
      outlet: "Tiong Bahru",
    },
    {
      slug: "farah-ismail",
      name: "Farah Ismail",
      role: "Senior stylist",
      specialities: ["Curly cuts", "Colour correction"],
      languages: ["English", "Bahasa Melayu"],
      outlet: "Tanjong Pagar",
    },
    {
      slug: "marcus-lim",
      name: "Marcus Lim",
      role: "Senior stylist",
      specialities: ["Short cuts", "Grey blending"],
      languages: ["English", "中文"],
      outlet: "Holland Village",
    },
    {
      slug: "anjali-menon",
      name: "Anjali Menon",
      role: "Stylist",
      specialities: ["Blow-dry", "Gloss"],
      languages: ["English", "தமிழ்"],
      outlet: "Tiong Bahru",
    },
  ],
  testimonials: [
    {
      quote:
        "She asked how I style it on an ordinary Tuesday, then cut for that. Six weeks on, it still falls right.",
      name: "Mei L.",
      service: "Precision cut",
      rating: 5,
    },
    {
      quote: "The price on the menu was exactly what I paid. No surprise add-ons at the counter.",
      name: "Hafiz A.",
      service: "Root colour",
      rating: 5,
    },
    {
      quote: "My balayage grew out so softly I went four months between visits.",
      name: "Clara T.",
      service: "Hand-painted balayage",
      rating: 5,
    },
  ],
  outlets: [
    {
      slug: "tiong-bahru",
      area: "Tiong Bahru",
      address: "18 Linen Arcade Walk, #01-12",
      postalCode: "160418",
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
      mrt: "5 min walk from Holland Village MRT (CC21)",
      hours: closedMondays,
      phone: "+65 6103 0000",
      whatsapp: "+65 8103 0000",
    },
  ],
  faqs: [
    {
      question: "How do I choose a stylist level?",
      answer:
        "Stylists suit most cuts and single-process colour. Seniors and the creative director take complex colour, corrections and bridal. Not sure? Ask on WhatsApp and we'll suggest one.",
    },
    {
      question: "How far ahead should I book?",
      answer:
        "Weekday slots are usually free within a few days. Weekends and senior stylists fill about two weeks ahead.",
    },
    {
      question: "Do prices include GST?",
      answer: "Yes. Every price shown includes 9% GST.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "Reschedule or cancel free of charge up to 24 hours before. After that, we may keep a S$20 late-cancellation fee.",
    },
    {
      question: "Do I need a strand test before colour?",
      answer:
        "For first-time colour with us, yes. It takes ten minutes and can be done on the same day, 48 hours before your appointment.",
    },
  ],
  closing: {
    title: "Ready when you are.",
    body: "Book online in under a minute, or message us and a stylist will reply.",
  },
  footer: {
    blurb: "A hair atelier for considered cuts and colour. A fictional demo brand.",
    hours: ["Mon–Fri 10 am–9 pm", "Sat 9 am–7 pm", "Sun 10 am–6 pm"],
  },
} satisfies Brand;
