import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/utils';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
}
