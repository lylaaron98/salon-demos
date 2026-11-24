import { z } from "zod";

/**
 * Schema for the CMS-editable part of a brand (`content/brands/<id>.json`).
 *
 * The JSON is written by Keystatic (see `keystatic.config.ts`, which mirrors this
 * schema field for field) or by hand. It is parsed at build time, so a bad edit
 * fails the build and CI instead of reaching the live site.
 *
 * Structural data stays in the brand's TypeScript file: ids, schema.org type,
 * outlets (coordinates, opening hours), the pricing table and booking offers.
 */

const text = z.string().trim().min(1);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");
/** Keystatic saves an empty text field as "". Treat that as "not set". */
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);
const textList = z.array(text);

export const brandContentSchema = z.object({
  tagline: text,
  description: text.max(170, "Keep the meta description under 170 characters"),
  primaryCta: text,
  hero: z.object({
    eyebrow: text,
    title: text,
    lead: text,
    secondaryCta: text,
    trust: textList,
  }),
  contact: z.object({ phone: text, whatsapp: text }),
  promo: z.object({ eyebrow: text, title: text, body: text, cta: text }),
  services: z
    .array(
      z.object({
        slug,
        title: text,
        category: text,
        summary: text,
        durationMin: z.number().int().positive(),
        priceFrom: z.number().nonnegative(),
        priceVaries: z.boolean(),
        badge: optionalText,
        featured: z.boolean().optional(),
      }),
    )
    .min(1)
    .refine((list) => new Set(list.map((s) => s.slug)).size === list.length, {
      message: "Service slugs must be unique",
    }),
  pricing: z.object({ title: text, intro: text }),
  whyUs: z.array(z.object({ title: text, body: text })),
  team: z.array(
    z.object({
      slug,
      name: text,
      role: text,
      specialities: textList,
      languages: textList,
      outlet: text,
    }),
  ),
  testimonials: z.array(
    z.object({
      quote: text,
      name: text,
      service: text,
      rating: z.number().int().min(1).max(5),
    }),
  ),
  faqs: z.array(z.object({ question: text, answer: text })),
  closing: z.object({ title: text, body: text }),
  footer: z.object({ blurb: text, hours: textList }),
});

export type BrandContent = z.output<typeof brandContentSchema>;

/** Parses a brand's JSON, naming the brand and field in any error. */
export function parseBrandContent(brandId: string, data: unknown): BrandContent {
  const result = brandContentSchema.safeParse(data);
  if (result.success) return result.data;
  throw new Error(
    `Invalid content in content/brands/${brandId}.json:\n${z.prettifyError(result.error)}`,
  );
}
