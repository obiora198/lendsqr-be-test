// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

jest.mock('@/modules/user/user.repository');
jest.mock('@/modules/wallet/wallet.repository');
jest.mock('@/modules/wallet/transaction.repository');

import { WalletService } from '../modules/wallet/wallet.service';
import { UserRepository } from '@/modules/user/user.repository';
import { WalletRepository } from '@/modules/wallet/wallet.repository';
import { TransactionRepository } from '@/modules/wallet/transaction.repository';
import { AppError } from '../utils';

const mockDb: any = {
  transaction: jest.fn(),
};

describe('WalletService', () => {
  let walletService: WalletService;

  let mockWalletRepository: any;
  let mockTransactionRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    walletService = new WalletService(mockDb);
    
    mockUserRepository = (UserRepository as jest.Mock).mock.instances[0];
    mockWalletRepository = (WalletRepository as jest.Mock).mock.instances[0];
    mockTransactionRepository = (TransactionRepository as jest.Mock).mock.instances[0];
  });

  describe('fundWallet', () => {
    it('should fund wallet', async () => {
      const userId = 'user-id';
      const mockWallet = { id: 'wallet-id', user_id: userId, balance: 500 };
      
      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      mockWalletRepository.findByUserId.mockResolvedValue(mockWallet);
      mockWalletRepository.update.mockResolvedValue({ ...mockWallet, balance: 1500 });
      mockTransactionRepository.create.mockResolvedValue({ reference: 'ref', amount: 1000, type: 'credit' });

      const result = await walletService.fundWallet(userId, 1000, mockDb);
      expect(result.wallet.balance).toBe(1500);
    });

    it('should fail to fund with zero or negative amount', async () => {
      await expect(walletService.fundWallet('user-id', 0, mockDb)).rejects.toThrow('Amount must be greater than zero');
      await expect(walletService.fundWallet('user-id', -10, mockDb)).rejects.toThrow('Amount must be greater than zero');
    });
  });

  describe('transfer', () => {
    const senderId = 'sender-id';
    const mockSender = { id: senderId, email: 'sender@example.com' };
    const mockRecipient = { id: 'rec-id', email: 'rec@example.com' };
    const mockSenderWallet = { id: 's-w', user_id: senderId, balance: 1000 };
    const mockRecipientWallet = { id: 'r-w', user_id: 'rec-id', balance: 200 };

    it('should transfer funds', async () => {
      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      
      mockUserRepository.findById.mockResolvedValue(mockSender);
      mockUserRepository.findByEmail.mockResolvedValue(mockRecipient);
      
      mockWalletRepository.findByUserId
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockRecipientWallet);

      const result = await walletService.transfer(senderId, 'rec@example.com', 500, mockDb);
      expect(result.senderBalance).toBe(500);
    });

    it('should fail transfer with insufficient funds', async () => {
      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      mockUserRepository.findById.mockResolvedValue(mockSender);
      mockUserRepository.findByEmail.mockResolvedValue(mockRecipient);
      mockWalletRepository.findByUserId
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockRecipientWallet);

      await expect(walletService.transfer(senderId, 'rec@example.com', 2000, mockDb)).rejects.toThrow('Insufficient funds');
    });

    it('should fail self-transfer', async () => {
      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      mockUserRepository.findById.mockResolvedValue(mockSender);

      await expect(walletService.transfer(senderId, 'sender@example.com', 100, mockDb)).rejects.toThrow('Self-transfer is not allowed');
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds', async () => {
      const userId = 'user-id';
      const mockWallet = { id: 'wallet-id', user_id: userId, balance: 1000 };
      
      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      mockWalletRepository.findByUserId.mockResolvedValue(mockWallet);
      mockWalletRepository.update.mockResolvedValue({ ...mockWallet, balance: 400 });
      mockTransactionRepository.create.mockResolvedValue({ reference: 'ref', amount: 600, type: 'debit' });

      const result = await walletService.withdraw(userId, 600, mockDb);
      expect(result.balance).toBe(400);
    });

    it('should fail withdrawal with insufficient funds', async () => {
      const userId = 'user-id';
      const mockWallet = { id: 'wallet-id', user_id: userId, balance: 100 };
      
      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      mockWalletRepository.findByUserId.mockResolvedValue(mockWallet);

      await expect(walletService.withdraw(userId, 200, mockDb)).rejects.toThrow('Insufficient funds');
    });
  });
});
