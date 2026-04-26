import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './apiError';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Invalid input.',
      details: err.issues.map((issue) => issue.message)
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
}
