import axios from 'axios';
import { PumpActivationResponse } from '../types';

const BACKEND_API_URL = 'http://localhost:3000/api';

export class PumpTool {
  /**
   * Activates the pump for a given duration.
   * @param {number} duration - The duration in seconds to activate the pump.
   * @returns {Promise<PumpActivationResponse>} A promise that resolves with the pump activation response.
   */
  async activatePump(duration: number): Promise<PumpActivationResponse> {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/pump/activate`, { duration });
      return response.data;
    } catch (error) {
      console.error('Error activating pump:', error);
      throw new Error('Failed to activate pump.');
    }
  }
}
