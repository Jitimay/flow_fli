import { FraudService } from './fraud.service';

export class PaymentService {
  private fraudService: FraudService;

  constructor() {
    this.fraudService = new FraudService();
  }

  /**
   * Processes a payment after checking for fraud.
   * This is a mock implementation.
   * @param amount The amount to process.
   * @param source The source of the payment.
   * @returns An object indicating success, fraud status, and a transaction ID.
   */
  public processPayment(amount: number, source: string): { success: boolean; transactionId?: string; message: string, fraudDetected: boolean } {
    const isFraud = this.fraudService.isFraudulent(amount, source);

    if (isFraud) {
      return {
        success: false,
        message: 'Transaction flagged as potentially fraudulent.',
        fraudDetected: true,
      };
    }

    // Simulate a successful payment
    if (amount > 0) {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        transactionId,
        message: 'Payment processed successfully.',
        fraudDetected: false,
      };
    }

    return {
      success: false,
      message: 'Invalid payment amount.',
      fraudDetected: false,
    };
  }
}
