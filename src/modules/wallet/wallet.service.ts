import { Knex } from 'knex';
import { WalletRepository } from './wallet.repository';
import { TransactionRepository } from './transaction.repository';
import { UserRepository } from '../user/user.repository';
import { generateReference } from '../../utils/helpers';
import { AppError } from '../../utils/errors';

export class WalletService {
  private walletRepository: WalletRepository;
  private transactionRepository: TransactionRepository;
  private userRepository: UserRepository;

  constructor(db: Knex) {
    this.walletRepository = new WalletRepository(db);
    this.transactionRepository = new TransactionRepository(db);
    this.userRepository = new UserRepository(db);
  }

  /**
   * Funds a user's wallet
   * @param userId - ID of the user
   * @param amount - Amount to fund
   * @param db - Knex instance for transaction
   * @returns {Promise<any>} - Updated wallet and transaction record
   */
  async fundWallet(userId: string, amount: number, db: Knex): Promise<any> {
    if (amount <= 0) {
      throw new AppError('Amount must be greater than zero', 400);
    }

    return db.transaction(async (trx) => {
      // 1. Find wallet by userId
      const wallet = await this.walletRepository.findByUserId(userId, trx);
      if (!wallet) {
        throw new AppError('Wallet not found', 404);
      }

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      // 2. Update wallet balance
      const updatedWallet = await this.walletRepository.update(
        wallet.id,
        { balance: balanceAfter },
        trx,
      );

      // 3. Record credit transaction
      const transaction = await this.transactionRepository.create(
        {
          reference: generateReference(),
          wallet_id: wallet.id,
          type: 'credit',
          amount,
          balance_before: balanceBefore,
          balance_after: balanceAfter,
          description: 'Wallet funding',
          status: 'success',
        },
        trx,
      );

      return {
        wallet: {
          balance: updatedWallet?.balance,
        },
        transaction: {
          reference: transaction.reference,
          amount: transaction.amount,
          type: transaction.type,
        },
      };
    });
  }
}
