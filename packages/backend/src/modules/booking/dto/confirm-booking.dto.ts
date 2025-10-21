import { z } from 'zod';

/**
 * Schema for confirming a booking with fake payment
 * As per OpenAPI spec, only accepts paymentMethod: 'fake'
 */
export const ConfirmBookingSchema = z.object({
  paymentMethod: z.literal('fake').describe('Payment method (only "fake" supported in POC)'),
});

export type ConfirmBookingDto = z.infer<typeof ConfirmBookingSchema>;
