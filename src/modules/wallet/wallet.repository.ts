import { Knex } from 'knex';
import { BaseRepository } from '../../utils/BaseRepository';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at?: Date;
  updated_at?: Date;
}

export class WalletRepository extends BaseRepository<Wallet> {
  constructor(db: Knex) {
    super(db, 'wallets');
  }

  async findByUserId(user_id: string, trx?: Knex.Transaction): Promise<Wallet | undefined> {
    return this.findOne({ user_id }, trx);
  }
}
