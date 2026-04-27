import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config/env';

export class AdjutorService {
  private client: AxiosInstance;

  constructor(client?: AxiosInstance) {
    this.client =
      client ||
      axios.create({
        baseURL: 'https://adjutor.lendsqr.com/v2',
        headers: {
          Authorization: `Bearer ${config.adjutorApiKey}`,
        },
      });
  }

  /**
   * Checks if a user is blacklisted on Karma
   * @param identity - Email or BVN
   * @returns {Promise<boolean>} - Returns true if blacklisted, false otherwise
   */
  async checkKarmaBlacklist(identity: string): Promise<boolean> {
    try {
      const response = await this.client.get(`/verification/karma/${identity}`);
      
      // If we get a 200 OK, it means the user is found in the karma database (blacklisted)
      if (response.status === 200) {
        return true;
      }
      
      return false;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      // If 404, the user is not blacklisted
      if (axiosError.response && axiosError.response.status === 404) {
        return false;
      }
      
      // For any other error, throw a wrapped error
      throw new Error(`Adjutor Service Error: ${axiosError.message}`);
    }
  }
}
