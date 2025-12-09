import axios from 'axios';
import { PaymentValidationResponse } from '../types';

const BACKEND_API_URL = 'http://localhost:3000/api';

export class PaymentTool {
  /**
   * Validates a payment by calling the backend API.
   * @param {number} amount - The amount of the payment.
   * @param {string} source - The source of the payment request.
   * @returns {Promise<PaymentValidationResponse>} A promise that resolves with the payment validation response.
   */
  async validatePayment(amount: number, source: string): Promise<PaymentValidationResponse> {
    try {
      const response = await axios.post(`${BACKEND_API_URL}/payment/process`, { amount, source });
      return response.data;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw new Error('Failed to validate payment.');
    }
  }
}
