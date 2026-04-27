import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AdjutorService } from '../../services/adjutor.service';
import database from '../../config/database';
import { formatResponse } from '../../utils/response.util';
import { catchAsync } from '../../utils/catchAsync';

const adjutorService = new AdjutorService();
const authService = new AuthService(database, adjutorService);

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.register(req.body, database);
    res.status(201).json(formatResponse('User registered successfully', result, 201));
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.status(200).json(formatResponse('Login successful', result, 200));
  });
}
