import { z } from 'zod';

const BookingConfigSchema = z.object({
  maxSeatsPerBooking: z.coerce.number().int().positive().default(5),
  expirationMinutes: z.coerce.number().int().positive().default(15),
});

export type BookingConfig = z.infer<typeof BookingConfigSchema>;

export function loadBookingConfig(): BookingConfig {
  return BookingConfigSchema.parse({
    maxSeatsPerBooking: process.env.BOOKING_MAX_SEATS,
    expirationMinutes: process.env.BOOKING_EXPIRATION_MINUTES,
  });
}

export const bookingConfig = loadBookingConfig();
