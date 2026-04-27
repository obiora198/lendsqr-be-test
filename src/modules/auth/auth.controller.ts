import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AdjutorService } from '../../services/adjutor.service';
import database from '../../config/database';
import { formatResponse } from '../../utils/response.util';

const adjutorService = new AdjutorService();
const authService = new AuthService(database, adjutorService);

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body, database);
      res.status(201).json(formatResponse('User registered successfully', result, 201));
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(formatResponse('Login successful', result, 200));
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  }
}
