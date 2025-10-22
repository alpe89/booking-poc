import { z } from 'zod'

/**
 * Maximum seats per booking (default value, can be overridden by env)
 */
export const DEFAULT_MAX_SEATS_PER_BOOKING = 5

/**
 * Schema for reserving a booking (creating a PENDING booking with expiration)
 */
export const ReserveBookingSchema = z.object({
  email: z.string().email('Invalid email format'),
  seats: z
    .number()
    .int('Seats must be an integer')
    .min(1, 'Must reserve at least 1 seat')
    .max(DEFAULT_MAX_SEATS_PER_BOOKING, `Cannot reserve more than ${DEFAULT_MAX_SEATS_PER_BOOKING} seats`),
  travelId: z.string().uuid('Travel ID must be a valid UUID'),
})

export type ReserveBookingDto = z.infer<typeof ReserveBookingSchema>

/**
 * Schema for confirming a booking with fake payment
 * As per OpenAPI spec, only accepts paymentMethod: 'fake'
 */
export const ConfirmBookingSchema = z.object({
  paymentMethod: z.literal('fake').describe('Payment method (only "fake" supported in POC)'),
})

export type ConfirmBookingDto = z.infer<typeof ConfirmBookingSchema>
