import type { CookieOptions, Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';
import { authService } from './auth.service.js';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.register(req.body);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    sendResponse(res, {
      statusCode: 201,
      message: 'Registration successful',
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    sendResponse(res, {
      message: 'Login successful',
      data: { user, accessToken: tokens.accessToken },
    });
  }),

  refresh: catchAsync(async (req: Request, res: Response) => {
    const token = (req.body?.refreshToken as string) ?? (req.cookies?.refreshToken as string);
    if (!token) throw AppError.unauthorized('Refresh token missing');
    const { tokens } = await authService.refresh(token);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    sendResponse(res, {
      message: 'Token refreshed',
      data: { accessToken: tokens.accessToken },
    });
  }),

  logout: catchAsync(async (_req: Request, res: Response) => {
    res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: undefined });
    sendResponse(res, { message: 'Logged out', data: null });
  }),

  me: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.sub);
    sendResponse(res, { data: user });
  }),
};
