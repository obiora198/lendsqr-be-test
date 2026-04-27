import { Request, Response, NextFunction } from 'express';
import database from '../config/database';
import { UserRepository } from '../modules/user/user.repository';

const userRepository = new UserRepository(database);

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing',
        statusCode: 401,
      });
    }

    const token = authHeader.split(' ')[1];
    const user = await userRepository.findByToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        statusCode: 401,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      statusCode: 500,
    });
  }
};
