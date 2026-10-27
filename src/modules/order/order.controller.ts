import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { orderService } from './order.service.js';

function requester(req: Request) {
  return { id: req.user!.sub, role: req.user!.role };
}

export const orderController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const data = await orderService.create(req.user!.sub, req.body);
    sendResponse(res, { statusCode: 201, message: 'Order placed', data });
  }),

  listMine: catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await orderService.listMine(req.user!.sub, req.query);
    sendResponse(res, { message: 'Orders fetched', data, meta });
  }),

  listAll: catchAsync(async (req: Request, res: Response) => {
    const { data, meta } = await orderService.listAll(req.query);
    sendResponse(res, { message: 'Orders fetched', data, meta });
  }),

  get: catchAsync(async (req: Request, res: Response) => {
    const data = await orderService.getById(String(req.params.id), requester(req));
    sendResponse(res, { data });
  }),

  updateStatus: catchAsync(async (req: Request, res: Response) => {
    const data = await orderService.updateStatus(String(req.params.id), req.body.status);
    sendResponse(res, { message: 'Order status updated', data });
  }),

  cancel: catchAsync(async (req: Request, res: Response) => {
    const data = await orderService.cancel(String(req.params.id), requester(req));
    sendResponse(res, { message: 'Order cancelled', data });
  }),
};
