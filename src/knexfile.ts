import type { Knex } from 'knex';
import { config } from './config/env';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
    },
    migrations: {
      directory: './database/migrations',
      extension: 'ts',
    },
  },
  test: {
    client: 'mysql2',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name + '_test',
    },
    migrations: {
      directory: './database/migrations',
      extension: 'ts',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'ts',
    },
  },
};

export default knexConfig;
