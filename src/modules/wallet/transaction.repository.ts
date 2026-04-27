import { Knex } from 'knex';
import { BaseRepository } from '../../utils/BaseRepository';

export interface Transaction {
  id: string;
  reference: string;
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  status: 'pending' | 'success' | 'failed';
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

export class TransactionRepository extends BaseRepository<Transaction> {
  constructor(db: Knex) {
    super(db, 'transactions');
  }

  async findByWalletId(wallet_id: string, trx?: Knex.Transaction): Promise<Transaction[]> {
    return this.findAll({ wallet_id }, trx);
  }

  async findByReference(reference: string, trx?: Knex.Transaction): Promise<Transaction | undefined> {
    return this.findOne({ reference }, trx);
  }
}
