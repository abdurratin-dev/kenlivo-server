import type { Response } from 'express';

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessPayload<T> {
  statusCode?: number;
  message?: string;
  data: T;
  meta?: Meta;
}

/** Uniform success envelope used by every controller. */
export function sendResponse<T>(res: Response, payload: SuccessPayload<T>): void {
  const { statusCode = 200, message = 'Success', data, meta } = payload;
  res.status(statusCode).json({
    success: true,
    message,
    ...(meta ? { meta } : {}),
    data,
  });
}
