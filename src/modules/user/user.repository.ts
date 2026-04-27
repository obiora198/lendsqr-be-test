import { Knex } from 'knex';
import { BaseRepository } from '../../utils/BaseRepository';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bvn: string;
  password_hash: string;
  token?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class UserRepository extends BaseRepository<User> {
  constructor(db: Knex) {
    super(db, 'users');
  }

  async findByEmail(email: string, trx?: Knex.Transaction): Promise<User | undefined> {
    return this.findOne({ email }, trx);
  }

  async findByToken(token: string, trx?: Knex.Transaction): Promise<User | undefined> {
    return this.findOne({ token }, trx);
  }
}
