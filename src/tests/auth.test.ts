// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

jest.mock('@/modules/user/user.repository');
jest.mock('@/modules/wallet/wallet.repository');
jest.mock('@/services/adjutor.service');

import { AuthService } from '../modules/auth/auth.service';
import { AdjutorService } from '@/services/adjutor.service';
import { UserRepository } from '@/modules/user/user.repository';
import { WalletRepository } from '@/modules/wallet/wallet.repository';
import { AppError } from '../utils';
import bcrypt from 'bcryptjs';

const mockDb: any = {
  transaction: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let mockAdjutorService: any;
  let mockUserRepository: any;
  let mockWalletRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // AdjutorService is usually passed as a mock object, but it's now a mock class
    mockAdjutorService = new AdjutorService();
    authService = new AuthService(mockDb, mockAdjutorService);
    
    mockUserRepository = (UserRepository as jest.Mock).mock.instances[0];
    mockWalletRepository = (WalletRepository as jest.Mock).mock.instances[0];
  });

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '08012345678',
      bvn: '12345678901',
      password: 'password123',
    };

    it('should register a user successfully when not blacklisted', async () => {
      mockAdjutorService.checkKarmaBlacklist.mockResolvedValue(false);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const mockUser = { id: 'user-id', ...registerDto };
      const mockWallet = { id: 'wallet-id', user_id: 'user-id', balance: 0 };
      
      mockDb.transaction.mockImplementation(async (callback: any) => callback('trx'));
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockWalletRepository.create.mockResolvedValue(mockWallet);

      const result = await authService.register(registerDto, mockDb);

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should reject registration when user is on Karma blacklist', async () => {
      mockAdjutorService.checkKarmaBlacklist.mockResolvedValue(true);
      await expect(authService.register(registerDto, mockDb)).rejects.toThrow();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login and return a token', async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 1);
      const mockUser = { id: 'user-id', email: loginDto.email, password_hash: hashedPassword };
      
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(result.token).toBeDefined();
    });

    it('should reject login for non-existent user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      await expect(authService.login(loginDto)).rejects.toThrow();
    });
  });
});
