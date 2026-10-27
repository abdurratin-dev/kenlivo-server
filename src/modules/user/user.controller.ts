import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { AppError } from '../../utils/AppError.js';
import { QueryBuilder } from '../../utils/queryBuilder.js';
import { User } from './user.model.js';

export const userController = {
  listAll: catchAsync(async (req: Request, res: Response) => {
    const qb = new QueryBuilder(User, req.query as Record<string, string>, ['name', 'email']);
    const { data, meta } = await qb.execute();
    sendResponse(res, { data, meta });
  }),

  updateOne: catchAsync(async (req: Request, res: Response) => {
    const { password, ...safe } = req.body as Record<string, unknown>;
    void password; // prevent password change via this endpoint
    const user = await User.findByIdAndUpdate(req.params.id, { $set: safe }, { new: true, runValidators: true });
    if (!user) throw AppError.notFound('User not found');
    sendResponse(res, { data: user });
  }),

  deleteOne: catchAsync(async (req: Request, res: Response) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw AppError.notFound('User not found');
    sendResponse(res, { statusCode: 204, data: null });
  }),
};
