import { z } from 'zod';
import { registry } from './registry';

export const ErrorSchema = registry.register(
  'Error',
  z.object({
    error: z.object({
      message: z.string(),
      details: z.unknown().optional(),
    }),
  }),
);

export const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: ErrorSchema } },
});
