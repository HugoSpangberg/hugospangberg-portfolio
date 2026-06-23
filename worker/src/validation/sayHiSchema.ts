import { z } from 'zod';

export const sayHiRequestSchema = z.object({
  turnstileToken: z.string().min(1).max(4096),
  locale: z.enum(['sv', 'en']),
  requestId: z.string().uuid(),
});

export type SayHiRequestBody = z.infer<typeof sayHiRequestSchema>;
