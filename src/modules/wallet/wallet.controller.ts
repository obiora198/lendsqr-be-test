import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { WalletService } from './wallet.service';
import database from '../../config/database';
import { formatResponse } from '../../utils/response.util';
import { catchAsync } from '../../utils/catchAsync';

const walletService = new WalletService(database);

export class WalletController {
  static fund = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { amount } = req.body;
    const result = await walletService.fundWallet(userId, amount, database);
    res.status(200).json(formatResponse('Wallet funded successfully', result, 200));
  });

  static transfer = catchAsync(async (req: AuthRequest, res: Response) => {
    const senderUserId = req.user.id;
    const { recipientEmail, amount } = req.body;
    const result = await walletService.transfer(senderUserId, recipientEmail, amount, database);
    res.status(200).json(formatResponse('Transfer successful', result, 200));
  });

  static withdraw = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { amount } = req.body;
    const result = await walletService.withdraw(userId, amount, database);
    res.status(200).json(formatResponse('Withdrawal successful', result, 200));
  });

  static getBalance = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const result = await walletService.getBalance(userId);
    res.status(200).json(formatResponse('Balance retrieved successfully', result, 200));
  });

  static getTransactions = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await walletService.getTransactions(userId, page, limit);
    res.status(200).json(formatResponse('Transactions retrieved successfully', result, 200));
  });
}
