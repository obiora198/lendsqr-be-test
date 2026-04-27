import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique reference string
 * @returns {string}
 */
export const generateReference = (): string => {
  return uuidv4();
};

/**
 * Generates a secure random token
 * @returns {string}
 */
export const generateToken = (): string => {
  const uuid = uuidv4();
  return Buffer.from(uuid).toString('base64');
};
