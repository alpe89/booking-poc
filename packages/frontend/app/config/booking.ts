/**
 * Booking-related configuration constants
 */

export const BOOKING_CONFIG = {
  /**
   * Maximum number of seats per booking
   */
  MAX_SEATS_PER_BOOKING: 5,

  /**
   * Threshold in seconds for showing warning (5 minutes)
   */
  TIMER_WARNING_THRESHOLD: 300,

  /**
   * Interval for server sync in milliseconds (30 seconds)
   */
  SYNC_INTERVAL: 30000,

  /**
   * Interval for countdown updates in milliseconds (1 second)
   */
  COUNTDOWN_INTERVAL: 1000,

  /**
   * Low stock threshold for showing "last seats" warning
   */
  LOW_STOCK_THRESHOLD: 2,
} as const

export type BookingConfig = typeof BOOKING_CONFIG
