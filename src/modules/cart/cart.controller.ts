import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { cartService } from './cart.service.js';

export const cartController = {
  get: catchAsync(async (req: Request, res: Response) => {
    const data = await cartService.get(req.user!.sub);
    sendResponse(res, { data });
  }),

  addItem: catchAsync(async (req: Request, res: Response) => {
    const data = await cartService.addItem(req.user!.sub, req.body.product, req.body.quantity);
    sendResponse(res, { statusCode: 201, message: 'Item added to cart', data });
  }),

  updateItem: catchAsync(async (req: Request, res: Response) => {
    const data = await cartService.updateItem(req.user!.sub, String(req.params.productId), req.body.quantity);
    sendResponse(res, { message: 'Cart item updated', data });
  }),

  removeItem: catchAsync(async (req: Request, res: Response) => {
    const data = await cartService.removeItem(req.user!.sub, String(req.params.productId));
    sendResponse(res, { message: 'Item removed from cart', data });
  }),

  clear: catchAsync(async (req: Request, res: Response) => {
    const data = await cartService.clear(req.user!.sub);
    sendResponse(res, { message: 'Cart cleared', data });
  }),
};
