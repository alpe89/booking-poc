import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type PaymentResult = {
  success: boolean;
  transactionId: string | null;
  errorCode: string | null;
};

@Injectable()
export class PaymentService {
  /**
   * Process a fake payment - always succeeds for POC purposes
   * As per OpenAPI spec, only accepts paymentMethod: 'fake'
   */
  async processFakePayment(): Promise<PaymentResult> {
    // Simulate network delay (300-800ms)
    await this.simulateDelay();

    // Fake payment always succeeds
    return {
      success: true,
      transactionId: `TXN_${randomUUID()}`,
      errorCode: null,
    };
  }

  /**
   * Simulate network delay between 300-800ms
   */
  private async simulateDelay(): Promise<void> {
    const delay = 300 + Math.random() * 500; // 300-800ms
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
