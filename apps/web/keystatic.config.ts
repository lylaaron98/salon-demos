import { config, fields, singleton } from "@keystatic/core";

/**
 * Keystatic CMS: edits each brand's copy in `content/brands/<id>.json`.
 *
 * - Locally (`pnpm dev`, then /keystatic) it reads and writes the files on disk.
 * - On the live site it commits to GitHub once the GitHub app is connected (see
 *   docs/cms.md). Every save is a commit, Vercel redeploys, and the build parses
 *   the JSON with `content/schema.ts`, so an invalid edit never goes live.
 *
 * Fields mirror `brandContentSchema` in the same order, so saved JSON diffs stay small.
 */

/** GitHub mode once the app exists, or while creating it (docs/cms.md, step 1). */
const useGitHub =
  Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG) ||
  process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

const required = { isRequired: true } as const;
const line = (label: string, description?: string) =>
  fields.text({ label, description, validation: { length: { min: 1 } } });
const paragraph = (label: string, description?: string) =>
  fields.text({ label, description, multiline: true, validation: { length: { min: 1 } } });
const slug = (label: string) =>
  fields.text({
    label,
    description: "Used in links. Lowercase letters, numbers and hyphens.",
    validation: {
      length: { min: 1 },
      pattern: {
        regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        message: "Use lowercase letters, numbers and hyphens",
      },
    },
  });
const list = (label: string, itemLabel: string) =>
  fields.array(line(itemLabel), { label, itemLabel: (props) => props.value || itemLabel });

const brandContent = {
  tagline: line("Tagline"),
  description: fields.text({
    label: "Meta description",
    description: "Shown in Google results. About 150 characters.",
    multiline: true,
    validation: { length: { min: 1, max: 170 } },
  }),
  primaryCta: line("Main booking button", 'For example "Book a stylist".'),
  hero: fields.object(
    {
      eyebrow: line("Eyebrow"),
      title: line("Headline"),
      lead: paragraph("Intro"),
      secondaryCta: line("Second button"),
      trust: list("Trust points", "Trust point"),
    },
    { label: "Hero" },
  ),
  contact: fields.object(
    { phone: line("Phone"), whatsapp: line("WhatsApp") },
    { label: "Main contact" },
  ),
  promo: fields.object(
    {
      eyebrow: line("Eyebrow"),
      title: line("Headline"),
      body: paragraph("Details"),
      cta: line("Button"),
    },
    { label: "Promotion banner" },
  ),
  services: fields.array(
    fields.object({
      slug: slug("Service ID"),
      title: line("Name"),
      category: line("Category"),
      summary: paragraph("Summary", "Two short sentences at most."),
      durationMin: fields.integer({
        label: "Duration (minutes)",
        validation: { ...required, min: 1 },
      }),
      priceFrom: fields.integer({
        label: "Price (S$, incl. GST)",
        validation: { ...required, min: 0 },
      }),
      priceVaries: fields.checkbox({ label: 'Show "from" before the price' }),
      badge: fields.text({ label: "Badge", description: 'Optional, e.g. "Most booked".' }),
      featured: fields.checkbox({ label: "Feature this service" }),
    }),
    { label: "Services", itemLabel: (props) => props.fields.title.value || "Service" },
  ),
  pricing: fields.object(
    { title: line("Heading"), intro: paragraph("Intro") },
    { label: "Pricing section", description: "Prices themselves are set by the developer." },
  ),
  whyUs: fields.array(fields.object({ title: line("Heading"), body: paragraph("Text") }), {
    label: "Why us",
    itemLabel: (props) => props.fields.title.value || "Reason",
  }),
  team: fields.array(
    fields.object({
      slug: slug("Profile ID"),
      name: line("Name"),
      role: line("Role"),
      specialities: list("Specialities", "Speciality"),
      languages: list("Languages", "Language"),
      outlet: line("Outlet", "Must match an outlet area, e.g. Tiong Bahru."),
    }),
    { label: "Team", itemLabel: (props) => props.fields.name.value || "Team member" },
  ),
  testimonials: fields.array(
    fields.object({
      quote: paragraph("Quote"),
      name: line("Name"),
      service: line("Service"),
      rating: fields.integer({
        label: "Rating (1–5)",
        defaultValue: 5,
        validation: { ...required, min: 1, max: 5 },
      }),
    }),
    { label: "Testimonials", itemLabel: (props) => props.fields.name.value || "Testimonial" },
  ),
  faqs: fields.array(fields.object({ question: line("Question"), answer: paragraph("Answer") }), {
    label: "FAQs",
    itemLabel: (props) => props.fields.question.value || "Question",
  }),
  closing: fields.object(
    { title: line("Heading"), body: paragraph("Text") },
    { label: "Closing banner" },
  ),
  footer: fields.object(
    { blurb: paragraph("Blurb"), hours: list("Opening hours lines", "Line") },
    { label: "Footer" },
  ),
};

const brand = (id: string, label: string) =>
  singleton({
    label,
    path: `content/brands/${id}`,
    format: { data: "json" },
    schema: brandContent,
  });

export default config({
  storage: useGitHub
    ? { kind: "github", repo: "lylaaron98/salon-demos", pathPrefix: "apps/web" }
    : { kind: "local" },
  ui: {
    brand: { name: "Orrin Collective" },
    navigation: { Brands: ["sable", "dewlab", "rootwell"] },
  },
  singletons: {
    sable: brand("sable", "Sable & Shear"),
    dewlab: brand("dewlab", "Dewlab Skin Studio"),
    rootwell: brand("rootwell", "Rootwell"),
  },
});
