import { everyDay, lateWeekdays } from "../hours";
import type { Brand } from "../types";

// Fictional brand. Names, addresses and numbers are invented demo content.
export const rootwell = {
  id: "rootwell",
  name: "Rootwell",
  shortName: "Rootwell",
  category: "Scalp care and wellness",
  tagline: "Healthy hair starts at the root.",
  description:
    "Rootwell is a fictional Singapore scalp-care studio: free scalp analysis, head spa and hair-loss programmes for men and women. Portfolio demo.",
  primaryCta: "Book a free scalp check",
  teamNoun: "scalp coaches",
  hero: {
    eyebrow: "Scalp care · Singapore",
    title: "Healthy hair starts at the root.",
    lead: "Start with a free 20-minute scalp check. See what is going on under the scope, then decide.",
    secondaryCta: "See prices",
    trust: ["4.8 ★ from 700+ reviews (demo)", "Free first check", "Men-friendly"],
  },
  contact: { phone: "+65 6300 0000", whatsapp: "+65 8300 0000" },
  promo: {
    eyebrow: "First trial",
    title: "Scalp reset trial, S$38.",
    body: "Usual price S$128. Scalp check, detox cleanse and a 20-minute head spa. Demo offer.",
    cta: "Claim the trial",
  },
  services: [
    {
      slug: "scalp-check",
      title: "Scalp check",
      category: "Diagnostics",
      summary: "Twenty minutes under a scalp camera, then a plain-English summary of what we see.",
      durationMin: 20,
      priceFrom: 0,
      priceVaries: false,
      badge: "Start here",
      featured: true,
    },
    {
      slug: "head-spa",
      title: "Signature head spa",
      category: "Head spa",
      summary: "Deep cleanse, scalp massage and steam. The calmest hour of your week.",
      durationMin: 60,
      priceFrom: 98,
      priceVaries: true,
    },
    {
      slug: "scalp-detox",
      title: "Scalp detox",
      category: "Treatments",
      summary: "Clears build-up and excess oil to settle an itchy, flaky or oily scalp.",
      durationMin: 45,
      priceFrom: 78,
      priceVaries: false,
    },
    {
      slug: "thinning-programme",
      title: "Thinning hair programme",
      category: "Programmes",
      summary: "A 12-week coached plan with monthly scope photos to track progress.",
      durationMin: 60,
      priceFrom: 388,
      priceVaries: true,
    },
  ],
  pricing: {
    title: "Head spa pricing",
    intro: "Your scalp check is free. After that, pay per visit or commit only if it is working.",
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
  whyUs: [
    {
      title: "Check first, then decide",
      body: "A free scalp check shows you what is happening before you spend anything.",
    },
    {
      title: "Coaching, not scare tactics",
      body: "We explain what is normal, what is not, and what you can do at home.",
    },
    {
      title: "Progress you can see",
      body: "Scope photos at every visit, so you can judge results yourself.",
    },
  ],
  team: [
    {
      slug: "daniel-ong",
      name: "Daniel Ong",
      role: "Head scalp coach",
      specialities: ["Thinning hair", "Men's scalp care"],
      languages: ["English", "中文"],
      outlet: "Bishan",
    },
    {
      slug: "rizwan-hassan",
      name: "Rizwan Hassan",
      role: "Senior scalp coach",
      specialities: ["Oily scalp", "Head spa"],
      languages: ["English", "Bahasa Melayu"],
      outlet: "Tampines",
    },
    {
      slug: "karen-goh",
      name: "Karen Goh",
      role: "Senior scalp coach",
      specialities: ["Postpartum shedding", "Sensitive scalp"],
      languages: ["English", "中文"],
      outlet: "Bishan",
    },
    {
      slug: "vikram-das",
      name: "Vikram Das",
      role: "Scalp coach",
      specialities: ["Detox", "Head spa"],
      languages: ["English", "हिन्दी"],
      outlet: "Tampines",
    },
  ],
  testimonials: [
    {
      quote:
        "I was sceptical. The check was quick, nobody tried to sell me a programme, and the advice was practical.",
      name: "Arjun K.",
      service: "Scalp check",
      rating: 5,
    },
    {
      quote:
        "Three months in and the scope photos show it. My scalp has stopped itching at the end of the day.",
      name: "Benjamin S.",
      service: "Scalp detox",
      rating: 5,
    },
    {
      quote: "The head spa is now my monthly reset. Calm room, no chatter unless you want it.",
      name: "Lina W.",
      service: "Signature head spa",
      rating: 4,
    },
  ],
  outlets: [
    {
      slug: "bishan",
      area: "Bishan",
      address: "512 Eucalyptus Close, #01-27",
      postalCode: "570512",
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
      mrt: "5 min walk from Tampines MRT (EW2 / DT32)",
      hours: everyDay,
      phone: "+65 6302 0000",
      whatsapp: "+65 8302 0000",
    },
  ],
  faqs: [
    {
      question: "Is the scalp check really free?",
      answer:
        "Yes. Twenty minutes with a scalp coach and a camera, then a summary. There is nothing to buy at the end.",
    },
    {
      question: "Is Rootwell only for hair loss?",
      answer:
        "No. Most visitors come for an oily, itchy or flaky scalp, or simply to relax with a head spa.",
    },
    {
      question: "Do you treat men?",
      answer: "Yes. About half of our visitors are men, and every outlet has private rooms.",
    },
    {
      question: "When should I see a doctor instead?",
      answer:
        "If you have sudden patchy hair loss, pain or open sores, see a doctor first. We will tell you if we think that is the right step.",
    },
    {
      question: "Do prices include GST?",
      answer: "Yes. Every price shown includes 9% GST.",
    },
  ],
  closing: {
    title: "Start with a 20-minute scalp check.",
    body: "Free, no obligation. Then decide what, if anything, comes next.",
  },
  footer: {
    blurb: "Scalp care and head spa, coached calmly. A fictional demo brand.",
    hours: ["Mon–Fri 10 am–9 pm", "Sat–Sun 9 am–7 pm", "Tampines open daily to 10 pm"],
  },
  offer: {
    id: "first-visit",
    label: "Scalp reset trial",
    services: ["head-spa"],
    price: 38,
  },
} satisfies Brand;
