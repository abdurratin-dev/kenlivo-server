import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(1),
  tagline: z.string().max(200).optional(),
  price: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100).optional(),
  category: objectId,
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const idParamSchema = z.object({ id: objectId });

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
  search: z.string().optional(),
  category: objectId.optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});
