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
  });

  describe('transfer', () => {
    it('should transfer funds', async () => {
      const senderId = 'sender-id';
      const mockSender = { id: senderId, email: 'sender@example.com' };
      const mockRecipient = { id: 'rec-id', email: 'rec@example.com' };
      const mockSenderWallet = { id: 's-w', user_id: senderId, balance: 1000 };
      const mockRecipientWallet = { id: 'r-w', user_id: 'rec-id', balance: 200 };

      mockDb.transaction.mockImplementation(async (callback: any) => callback(mockDb));
      
      const userRepoInstance = (UserRepository as jest.Mock).mock.instances[0];
      userRepoInstance.findById.mockResolvedValue(mockSender);
      userRepoInstance.findByEmail.mockResolvedValue(mockRecipient);
      
      mockWalletRepository.findByUserId
        .mockResolvedValueOnce(mockSenderWallet)
        .mockResolvedValueOnce(mockRecipientWallet);

      const result = await walletService.transfer(senderId, 'rec@example.com', 500, mockDb);
      expect(result.senderBalance).toBe(500);
    });
  });
});
