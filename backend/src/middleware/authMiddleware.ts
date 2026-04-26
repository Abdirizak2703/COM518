import { Request, Response, NextFunction } from 'express';
import { ApiError } from './apiError';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.user) {
    res.status(401).json({ error: 'You must be logged in to perform this action.' });
    return;
  }

  next();
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = req.session.user;
  if (!user) {
    next(new ApiError(401, 'You must be logged in to perform this action.'));
    return;
  }

  if (!user.admin) {
    next(new ApiError(403, 'Admin access is required for this action.'));
    return;
  }

  next();
}
