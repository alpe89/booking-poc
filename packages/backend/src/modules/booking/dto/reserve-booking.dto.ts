import { z } from 'zod';
import { bookingConfig } from '@shared/config/booking.config.js';

/**
 * Schema for reserving a booking (creating a PENDING booking with expiration)
 */
export const ReserveBookingSchema = z.object({
  email: z.string().email('Invalid email format'),
  seats: z
    .number()
    .int('Seats must be an integer')
    .min(1, 'Must reserve at least 1 seat')
    .max(
      bookingConfig.maxSeatsPerBooking,
      `Cannot reserve more than ${bookingConfig.maxSeatsPerBooking} seats`,
    ),
  travelId: z.string().uuid('Travel ID must be a valid UUID'),
});

export type ReserveBookingDto = z.infer<typeof ReserveBookingSchema>;
