import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { statusCode, message } = err;

  if (!(err instanceof AppError)) {
    statusCode = 500;
    message = 'Internal Server Error';
    // Log non-operational errors for debugging
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
};
