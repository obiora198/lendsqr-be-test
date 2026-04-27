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

  /**
   * Transfers funds between two wallets
   * @param senderUserId - ID of the sender
   * @param recipientEmail - Email of the recipient
   * @param amount - Amount to transfer
   * @param db - Knex instance for transaction
   * @returns {Promise<any>} - Success message and reference
   */
  async transfer(
    senderUserId: string,
    recipientEmail: string,
    amount: number,
    db: Knex,
  ): Promise<any> {
    if (amount <= 0) {
      throw new AppError('Amount must be greater than zero', 400);
    }

    return db.transaction(async (trx) => {
      // 1. Find sender and recipient
      const sender = await this.userRepository.findById(senderUserId, trx);
      if (!sender) {
        throw new AppError('Sender not found', 404);
      }

      if (sender.email === recipientEmail) {
        throw new AppError('Self-transfer is not allowed', 400);
      }

      const recipient = await this.userRepository.findByEmail(recipientEmail, trx);
      if (!recipient) {
        throw new AppError('Recipient not found', 404);
      }

      // 2. Find wallets
      const senderWallet = await this.walletRepository.findByUserId(sender.id, trx);
      const recipientWallet = await this.walletRepository.findByUserId(recipient.id, trx);

      if (!senderWallet || !recipientWallet) {
        throw new AppError('Wallet not found for one of the users', 404);
      }

      // 3. Validate balance
      const senderBalanceBefore = Number(senderWallet.balance);
      if (senderBalanceBefore < amount) {
        throw new AppError('Insufficient funds', 400);
      }

      const recipientBalanceBefore = Number(recipientWallet.balance);
      const reference = generateReference();

      // 4. Update balances
      const senderBalanceAfter = senderBalanceBefore - amount;
      const recipientBalanceAfter = recipientBalanceBefore + amount;

      await this.walletRepository.update(senderWallet.id, { balance: senderBalanceAfter }, trx);
      await this.walletRepository.update(
        recipientWallet.id,
        { balance: recipientBalanceAfter },
        trx,
      );

      // 5. Record transactions
      await this.transactionRepository.create(
        {
          reference,
          wallet_id: senderWallet.id,
          type: 'debit',
          amount,
          balance_before: senderBalanceBefore,
          balance_after: senderBalanceAfter,
          description: `Transfer to ${recipientEmail}`,
          status: 'success',
        },
        trx,
      );

      await this.transactionRepository.create(
        {
          reference,
          wallet_id: recipientWallet.id,
          type: 'credit',
          amount,
          balance_before: recipientBalanceBefore,
          balance_after: recipientBalanceAfter,
          description: `Transfer from ${sender.email}`,
          status: 'success',
        },
        trx,
      );

      return {
        message: 'Transfer successful',
        reference,
        amount,
        senderBalance: senderBalanceAfter,
      };
    });
  }
}
