import { z } from 'zod';

export const deliveryApiContentResponseSchema = z
  .object({
    contentType: z.string().optional(),
    name: z.string().optional(),
    route: z.unknown().optional(),
    properties: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

export type DeliveryApiContentResponse = z.infer<
  typeof deliveryApiContentResponseSchema
>;
