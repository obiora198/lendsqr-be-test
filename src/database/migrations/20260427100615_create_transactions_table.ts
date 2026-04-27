import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('reference', 100).notNullable().unique();
    table
      .uuid('wallet_id')
      .notNullable()
      .references('id')
      .inTable('wallets')
      .onDelete('CASCADE');
    table.enum('type', ['credit', 'debit']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.decimal('balance_before', 15, 2).notNullable();
    table.decimal('balance_after', 15, 2).notNullable();
    table.string('description', 255).notNullable();
    table.enum('status', ['pending', 'success', 'failed']).defaultTo('success');
    table.json('metadata').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
