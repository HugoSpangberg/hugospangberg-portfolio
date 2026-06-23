import { z } from 'zod';

const heroActionSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(['primary', 'ghost']),
  external: z.boolean().optional(),
});

const textListSchema = z.array(z.string().min(1));

export const portfolioContentSchema = z
  .object({
    seo: z.object({
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(240),
    }),
    nav: z.array(
      z.object({
        label: z.string().min(1).max(40),
        href: z.string().startsWith('#'),
      }),
    ),
    hero: z
      .object({
        eyebrow: z.string().min(1),
        title: z.string().min(1),
        role: z.string().min(1),
        subtitle: z.string().min(1),
        tagline: z.string().min(1),
        actionsLabel: z.string().min(1),
        actions: z.array(heroActionSchema),
        availability: z.string().min(1),
        stack: z.string().min(1),
        sceneLabel: z.string().min(1),
        fallbackLabel: z.string().min(1),
      })
      .passthrough(),
    about: z
      .object({
        kicker: z.string().min(1),
        title: z.string().min(1),
        paragraphs: textListSchema,
        lookingForTitle: z.string().min(1),
        lookingFor: textListSchema,
        highlights: textListSchema,
      })
      .passthrough(),
    skills: z.object({ items: z.array(z.unknown()) }).passthrough(),
    systemThinking: z.object({ cards: z.array(z.unknown()) }).passthrough(),
    experience: z.object({ items: z.array(z.unknown()) }).passthrough(),
    education: z.object({ items: z.array(z.unknown()) }).passthrough(),
    labs: z.object({ items: z.array(z.unknown()) }).passthrough(),
    sayHi: z
      .object({
        title: z.string().min(1),
        buttonLabel: z.string().min(1),
        loadingLabel: z.string().min(1),
        successDialog: z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          localBody: z.string().min(1),
          privacy: z.string().min(1),
          technicalPrivacy: z.string().min(1),
          closeLabel: z.string().min(1),
        }),
        errorDialog: z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          closeLabel: z.string().min(1),
        }),
      })
      .passthrough(),
    builtWith: z
      .object({
        sections: z.array(
          z.object({
            title: z.string().min(1),
            items: textListSchema,
          }),
        ),
      })
      .passthrough(),
    contact: z.object({ links: z.array(z.unknown()) }).passthrough(),
    footer: z.object({ text: z.string().min(1), backToTop: z.string().min(1) }).passthrough(),
  })
  .passthrough();
