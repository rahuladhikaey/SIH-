import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${message}`, {
    stack: config.env === 'development' ? err.stack : undefined,
    errors: err.errors,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(err.errors && { details: err.errors }),
      ...(config.env === 'development' && { stack: err.stack }),
    },
  });
};
