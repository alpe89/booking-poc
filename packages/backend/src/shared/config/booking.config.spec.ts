import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('BookingConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset modules to get fresh config
    vi.resetModules();
    // Clone env
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('loadBookingConfig', () => {
    it('should load config with default values when env vars are not set', async () => {
      delete process.env.BOOKING_MAX_SEATS;
      delete process.env.BOOKING_EXPIRATION_MINUTES;

      const { loadBookingConfig } = await import('./booking.config.js');
      const config = loadBookingConfig();

      expect(config).toEqual({
        maxSeatsPerBooking: 5,
        expirationMinutes: 15,
      });
    });

    it('should load config from environment variables', async () => {
      process.env.BOOKING_MAX_SEATS = '10';
      process.env.BOOKING_EXPIRATION_MINUTES = '30';

      const { loadBookingConfig } = await import('./booking.config.js');
      const config = loadBookingConfig();

      expect(config).toEqual({
        maxSeatsPerBooking: 10,
        expirationMinutes: 30,
      });
    });

    it('should coerce string env vars to numbers', async () => {
      process.env.BOOKING_MAX_SEATS = '7';
      process.env.BOOKING_EXPIRATION_MINUTES = '20';

      const { loadBookingConfig } = await import('./booking.config.js');
      const config = loadBookingConfig();

      expect(typeof config.maxSeatsPerBooking).toBe('number');
      expect(typeof config.expirationMinutes).toBe('number');
      expect(config.maxSeatsPerBooking).toBe(7);
      expect(config.expirationMinutes).toBe(20);
    });

    it('should reject negative values for maxSeatsPerBooking', async () => {
      process.env.BOOKING_MAX_SEATS = '-5';
      process.env.BOOKING_EXPIRATION_MINUTES = '15';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should reject negative values for expirationMinutes', async () => {
      process.env.BOOKING_MAX_SEATS = '5';
      process.env.BOOKING_EXPIRATION_MINUTES = '-10';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should reject zero for maxSeatsPerBooking', async () => {
      process.env.BOOKING_MAX_SEATS = '0';
      process.env.BOOKING_EXPIRATION_MINUTES = '15';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should reject zero for expirationMinutes', async () => {
      process.env.BOOKING_MAX_SEATS = '5';
      process.env.BOOKING_EXPIRATION_MINUTES = '0';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should reject non-integer values for maxSeatsPerBooking', async () => {
      process.env.BOOKING_MAX_SEATS = '5.5';
      process.env.BOOKING_EXPIRATION_MINUTES = '15';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should reject non-integer values for expirationMinutes', async () => {
      process.env.BOOKING_MAX_SEATS = '5';
      process.env.BOOKING_EXPIRATION_MINUTES = '15.7';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should reject invalid string values', async () => {
      process.env.BOOKING_MAX_SEATS = 'invalid';
      process.env.BOOKING_EXPIRATION_MINUTES = '15';

      await expect(async () => {
        await import('./booking.config.js');
      }).rejects.toThrow();
    });

    it('should accept very large valid values', async () => {
      process.env.BOOKING_MAX_SEATS = '1000';
      process.env.BOOKING_EXPIRATION_MINUTES = '10080'; // 1 week in minutes

      const { loadBookingConfig } = await import('./booking.config.js');
      const config = loadBookingConfig();

      expect(config.maxSeatsPerBooking).toBe(1000);
      expect(config.expirationMinutes).toBe(10080);
    });

    it('should handle mixed valid and undefined env vars', async () => {
      process.env.BOOKING_MAX_SEATS = '8';
      delete process.env.BOOKING_EXPIRATION_MINUTES;

      const { loadBookingConfig } = await import('./booking.config.js');
      const config = loadBookingConfig();

      expect(config.maxSeatsPerBooking).toBe(8);
      expect(config.expirationMinutes).toBe(15); // default
    });
  });

  describe('bookingConfig singleton', () => {
    it('should export a pre-loaded config instance', async () => {
      process.env.BOOKING_MAX_SEATS = '3';
      process.env.BOOKING_EXPIRATION_MINUTES = '10';

      const { bookingConfig } = await import('./booking.config.js');

      expect(bookingConfig).toBeDefined();
      expect(bookingConfig.maxSeatsPerBooking).toBe(3);
      expect(bookingConfig.expirationMinutes).toBe(10);
    });
  });
});
