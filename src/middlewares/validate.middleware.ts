import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map((details) => details.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage,
        statusCode: 400,
      });
    }
    
    next();
  };
};
