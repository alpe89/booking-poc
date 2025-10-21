import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service.js';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentService],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('processFakePayment', () => {
    it('should always return success for fake payment', async () => {
      const result = await service.processFakePayment();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('errorCode');
      expect(result.success).toBe(true);
      expect(result.errorCode).toBeNull();
    });

    it('should return a valid transaction ID', async () => {
      const result = await service.processFakePayment();

      expect(result.transactionId).not.toBeNull();
      expect(typeof result.transactionId).toBe('string');
      expect(result.transactionId).toMatch(/^TXN_/);
    });

    it('should simulate network delay', async () => {
      const startTime = Date.now();
      await service.processFakePayment();
      const endTime = Date.now();
      const elapsed = endTime - startTime;

      // Should take at least 300ms (minimum delay)
      expect(elapsed).toBeGreaterThanOrEqual(300);
      // Should not take more than 900ms (max delay + buffer)
      expect(elapsed).toBeLessThan(900);
    });

    it('should return unique transaction IDs for multiple calls', async () => {
      const result1 = await service.processFakePayment();
      const result2 = await service.processFakePayment();

      expect(result1.transactionId).not.toBe(result2.transactionId);
    });

    it('should always have errorCode null on success', async () => {
      const results = await Promise.all([
        service.processFakePayment(),
        service.processFakePayment(),
        service.processFakePayment(),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.errorCode).toBeNull();
      });
    });
  });
});
