// A simple in-memory store for transaction history
const transactionHistory: Record<string, { count: number, firstTransactionTime: number }> = {};

const FRAUD_THRESHOLD_COUNT = 10;
const FRAUD_THRESHOLD_TIMEFRAME_MS = 60 * 1000; // 1 minute
const MINIMUM_AMOUNT_THRESHOLD = 0.50; // $0.50

export class FraudService {
  /**
   * Checks if a transaction is potentially fraudulent.
   * @param amount The transaction amount.
   * @param source The source identifier of the transaction.
   * @returns {boolean} True if fraud is detected, false otherwise.
   */
  public isFraudulent(amount: number, source: string): boolean {
    const now = Date.now();

    // Rule 1: Very low transaction amount
    if (amount < MINIMUM_AMOUNT_THRESHOLD) {
      console.log(`[Fraud Detection] Flagged: Transaction amount $${amount} is below minimum threshold of $${MINIMUM_AMOUNT_THRESHOLD}.`);
      return true;
    }

    // Rule 2: High frequency of transactions from the same source
    const sourceHistory = transactionHistory[source];

    if (sourceHistory) {
      const timeDifference = now - sourceHistory.firstTransactionTime;
      
      if (timeDifference < FRAUD_THRESHOLD_TIMEFRAME_MS) {
        sourceHistory.count++;
        if (sourceHistory.count > FRAUD_THRESHOLD_COUNT) {
          console.log(`[Fraud Detection] Flagged: Source '${source}' exceeded ${FRAUD_THRESHOLD_COUNT} transactions in under ${FRAUD_THRESHOLD_TIMEFRAME_MS / 1000}s.`);
          return true;
        }
      } else {
        // Reset if the timeframe has passed
        sourceHistory.count = 1;
        sourceHistory.firstTransactionTime = now;
      }
    } else {
      transactionHistory[source] = {
        count: 1,
        firstTransactionTime: now,
      };
    }

    return false;
  }
}
