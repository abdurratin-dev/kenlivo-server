import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const addItemSchema = z.object({
  product: objectId,
  quantity: z.number().int().positive().max(999).default(1),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().positive().max(999),
});

export const productParamSchema = z.object({ productId: objectId });
