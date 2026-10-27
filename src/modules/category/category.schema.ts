import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
});
