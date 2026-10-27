import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { categoryService } from './category.service.js';

export const categoryController = {
  list: catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await categoryService.list(req.query);
    sendResponse(res, { message: 'Categories fetched', data, meta });
  }),

  get: catchAsync(async (req: Request, res: Response) => {
    const data = await categoryService.getById(String(req.params.id));
    sendResponse(res, { data });
  }),

  create: catchAsync(async (req: Request, res: Response) => {
    const data = await categoryService.create(req.body);
    sendResponse(res, { statusCode: 201, message: 'Category created', data });
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const data = await categoryService.update(String(req.params.id), req.body);
    sendResponse(res, { message: 'Category updated', data });
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await categoryService.remove(String(req.params.id));
    sendResponse(res, { message: 'Category deleted', data: null });
  }),
};
