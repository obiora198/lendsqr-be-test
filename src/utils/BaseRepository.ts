import { Knex } from 'knex';

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
    const [id] = await (trx || this.db)(this.tableName).insert(data);
    // Note: MySQL insert returns an array with the auto-increment ID if applicable.
    // Since we use UUIDs, we should probably return the record or the ID.
    // If id is 0 (because we provided UUID), we use data.id.
    const recordId = data.id || id;
    return this.findById(recordId as string, trx) as Promise<T>;
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
