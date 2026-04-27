import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('name', 100).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('phone', 20).notNullable();
    table.string('bvn', 20).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('token', 500).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
