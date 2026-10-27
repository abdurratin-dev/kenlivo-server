import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { productService } from './product.service.js';

export const productController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await productService.list(req.query);
    sendResponse(res, { message: 'Products fetched', data, meta });
  }),

  get: catchAsync(async (req: Request, res: Response) => {
    const data = await productService.getById(String(req.params.id));
    sendResponse(res, { data });
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const data = await productService.create(req.body);
    sendResponse(res, { statusCode: 201, message: 'Product created', data });
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const data = await productService.update(String(req.params.id), req.body);
    sendResponse(res, { message: 'Product updated', data });
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await productService.remove(String(req.params.id));
    sendResponse(res, { message: 'Product deleted', data: null });
  }),
};
