import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_METHODS } from './order.model.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const createOrderSchema = z.object({
  // If items omitted, the server builds the order from the user's cart.
  items: z
    .array(
      z.object({
        product: objectId,
        quantity: z.number().int().positive().max(999),
      }),
    )
    .optional(),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(5),
    street: z.string().min(2),
    city: z.string().min(2),
    postalCode: z.string().optional(),
    country: z.string().min(2),
  }),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const idParamSchema = z.object({ id: objectId });

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  status: z.enum(ORDER_STATUSES).optional(),
});
