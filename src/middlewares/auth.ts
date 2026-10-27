import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt.js';
import type { UserRole } from '../modules/user/user.model.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Requires a valid access token (Authorization: Bearer <token> or `accessToken` cookie). */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const token = bearer ?? (req.cookies?.accessToken as string | undefined);

  if (!token) {
    throw AppError.unauthorized('Authentication required');
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

/** Restricts a route to one or more roles. Must run after `authenticate`. */
export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw AppError.unauthorized('Authentication required');
    if (roles.length && !roles.includes(req.user.role)) {
      throw AppError.forbidden('You do not have permission to perform this action');
    }
    next();
  };
}
