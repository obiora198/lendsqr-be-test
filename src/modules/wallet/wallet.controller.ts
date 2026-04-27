import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { WalletService } from './wallet.service';
import database from '../../config/database';
import { formatResponse } from '../../utils/response.util';

const walletService = new WalletService(database);

export class WalletController {
  static async fund(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { amount } = req.body;
      
      const result = await walletService.fundWallet(userId, amount, database);
      res.status(200).json(formatResponse('Wallet funded successfully', result, 200));
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  }

  static async transfer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const senderUserId = req.user.id;
      const { recipientEmail, amount } = req.body;
      
      const result = await walletService.transfer(senderUserId, recipientEmail, amount, database);
      res.status(200).json(formatResponse('Transfer successful', result, 200));
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  }
}
