import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required().description('Database host name'),
  DB_PORT: Joi.number().default(3306).description('Database port number'),
  DB_USER: Joi.string().required().description('Database user name'),
  DB_PASSWORD: Joi.string().allow('').required().description('Database password'),
  DB_NAME: Joi.string().required().description('Database name'),
  DB_SSL: Joi.boolean().default(false).description('Whether to use SSL for database connection'),
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  ADJUTOR_API_KEY: Joi.string().required().description('Adjutor API key'),
  ENFORCE_KARMA_BLACKLIST: Joi.boolean().default(false).description('Whether to strictly enforce Karma blacklist'),
})
  .unknown()
  .required();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
    ssl: envVars.DB_SSL || envVars.NODE_ENV === 'production',
  },
  jwtSecret: envVars.JWT_SECRET,
  adjutorApiKey: envVars.ADJUTOR_API_KEY,
  enforceKarmaBlacklist: envVars.ENFORCE_KARMA_BLACKLIST,
};
