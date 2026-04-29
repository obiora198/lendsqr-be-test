import bcrypt from 'bcryptjs';
import { Knex } from 'knex';
import { UserRepository, User } from '@/modules/user/user.repository';
import { WalletRepository } from '@/modules/wallet/wallet.repository';
import { AdjutorService } from '@/services/adjutor.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { generateToken } from '../../utils/helpers';
import { AppError } from '../../utils';
import { config } from '../../config/env';

export class AuthService {
  private userRepository: UserRepository;
  private walletRepository: WalletRepository;
  private adjutorService: AdjutorService;

  constructor(db: Knex, adjutorService: AdjutorService) {
    this.userRepository = new UserRepository(db);
    this.walletRepository = new WalletRepository(db);
    this.adjutorService = adjutorService;
  }

  /**
   * Registers a new user
   * @param dto - Registration data
   * @param db - Knex instance for transaction
   * @returns {Promise<any>} - Sanitized user, wallet and token
   */
  async register(dto: RegisterDto, db: Knex): Promise<any> {
    // 1. Check Karma blacklist by email and BVN
    const emailKarmaData = await this.adjutorService.checkKarmaBlacklist(dto.email);
    const bvnKarmaData = await this.adjutorService.checkKarmaBlacklist(dto.bvn);

    if (emailKarmaData || bvnKarmaData) {
      if (config.enforceKarmaBlacklist) {
        throw new AppError('Identity is flagged on Karma blacklist and cannot be onboarded', 403);
      }
      console.warn(`[ENFORCEMENT BYPASSED] User ${dto.email} / ${dto.bvn} found on Karma blacklist, but allowing signup for review.`);
    }

    // 2. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Create user and wallet in a transaction
    return db.transaction(async (trx) => {
      const token = generateToken();
      
      const user = await this.userRepository.create(
        {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          bvn: dto.bvn,
          password_hash: passwordHash,
          token,
        },
        trx,
      );

      const wallet = await this.walletRepository.create(
        {
          user_id: user.id,
          balance: 0.0,
        },
        trx,
      );

      // Sanitize user (remove password hash)
      const { password_hash, ...sanitizedUser } = user as any;

      return {
        user: sanitizedUser,
        wallet,
        token,
        compliance: {
          email_lookup: {
            status: emailKarmaData ? 'Found on Blacklist' : 'Clean',
            data: emailKarmaData || null,
          },
          bvn_lookup: {
            status: bvnKarmaData ? 'Found on Blacklist' : 'Clean',
            data: bvnKarmaData || null,
          },
        },
      };
    });
  }

  /**
   * Logs in a user
   * @param dto - Login data
   * @returns {Promise<any>} - User and token
   */
  async login(dto: LoginDto): Promise<any> {
    if (!dto || !dto.email) {
      throw new AppError('Login data (email and password) is required', 400);
    }
    // 1. Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Compare password hash
    const isPasswordMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generate new token
    const token = generateToken();

    // 4. Update user token in DB
    await this.userRepository.update(user.id, { token });

    // 5. Sanitize user
    const { password_hash, ...sanitizedUser } = user as any;
    sanitizedUser.token = token;

    return {
      user: sanitizedUser,
      token,
    };
  }
}
