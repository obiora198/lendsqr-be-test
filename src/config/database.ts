import knex from 'knex';
import knexConfig from '../knexfile';
import { config } from './env';

const environment = config.env || 'development';
const database = knex(knexConfig[environment]);

export default database;
