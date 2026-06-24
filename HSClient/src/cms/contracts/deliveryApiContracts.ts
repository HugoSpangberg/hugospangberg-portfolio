import { z } from 'zod';

export const portfolioApiContentResponseSchema = z
  .object({
    locale: z.enum(['sv', 'en']),
    source: z.string().min(1),
    generatedAtUtc: z.string().min(1),
    content: z.unknown(),
  })
  .passthrough();

export type PortfolioApiContentResponse = z.infer<
  typeof portfolioApiContentResponseSchema
>;
