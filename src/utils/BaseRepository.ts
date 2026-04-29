import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly db: Knex,
    protected readonly tableName: string,
  ) {}

  async findById(id: string, trx?: Knex.Transaction): Promise<T | undefined> {
    return (trx || this.db)(this.tableName).where({ id }).first();
  }

  async findOne(filter: Partial<T>, trx?: Knex.Transaction): Promise<T | undefined> {
    return (trx || this.db)(this.tableName).where(filter).first();
  }

  async findAll(filter: Partial<T> = {}, trx?: Knex.Transaction): Promise<T[]> {
    return (trx || this.db)(this.tableName).where(filter);
  }

  async create(data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
    const id = data.id || uuidv4();
    const payload = { ...data, id };
    
    await (trx || this.db)(this.tableName).insert(payload);
    
    return (await this.findById(id as string, trx)) as T;
  }

  async update(id: string, data: Partial<T>, trx?: Knex.Transaction): Promise<T | undefined> {
    await (trx || this.db)(this.tableName).where({ id }).update(data);
    return this.findById(id, trx);
  }

  async delete(id: string, trx?: Knex.Transaction): Promise<boolean> {
    const deleted = await (trx || this.db)(this.tableName).where({ id }).delete();
    return !!deleted;
  }
}
