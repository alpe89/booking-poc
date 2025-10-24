import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { ZodExceptionFilter } from '../../shared/filters/zod-exception.filter.js';
import { PrismaService } from '@shared/prisma/prisma.service.js';

describe('BookingController (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testTravelId: string;
  let fullyBookedTravelId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Register global exception filters
    app.useGlobalFilters(new ZodExceptionFilter());

    await app.init();

    // Get test travel IDs from seeded data
    const parisTravel = await prisma.travel.findUnique({
      where: { slug: 'paris-romance' },
    });
    const icelandTravel = await prisma.travel.findUnique({
      where: { slug: 'iceland-northern-lights' },
    });

    testTravelId = parisTravel!.id;
    fullyBookedTravelId = icelandTravel!.id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean bookings created during tests (keep seeded data)
    await prisma.booking.deleteMany({
      where: {
        OR: [
          { email: { contains: 'integration-test' } },
          { email: { contains: 'concurrent-user' } },
          { email: { contains: 'race-user' } },
          { email: { contains: 'expired-test' } },
        ],
      },
    });
  });

  describe('POST /api/bookings/reserve', () => {
    it('should create a pending booking with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: 2,
          travelId: testTravelId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      const booking = response.body.data;
      const meta = response.body.meta;

      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('email', 'integration-test@example.com');
      expect(booking).toHaveProperty('seats', 2);
      expect(booking).toHaveProperty('travelId', testTravelId);
      expect(booking).toHaveProperty('status', 'PENDING');
      expect(booking).toHaveProperty('totalAmount');
      expect(booking.totalAmount).toBeGreaterThan(0);

      // expiresAt is now in meta
      expect(meta).toHaveProperty('expiresAt');
      const expiresAt = new Date(meta.expiresAt);
      const now = new Date();
      const diffMinutes = (expiresAt.getTime() - now.getTime()) / 1000 / 60;
      expect(diffMinutes).toBeGreaterThan(14);
      expect(diffMinutes).toBeLessThan(16);
    });

    it('should reject booking with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'invalid-email',
          seats: 2,
          travelId: testTravelId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('email');
    });

    it('should reject booking with invalid seats (0)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: 0,
          travelId: testTravelId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('seats');
    });

    it('should reject booking with invalid seats (negative)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: -1,
          travelId: testTravelId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject booking with too many seats (more than max)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: 10, // Max is 5 by default
          travelId: testTravelId,
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('seats');
    });

    it('should reject booking with invalid travel ID format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: 2,
          travelId: 'not-a-uuid',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('travelId');
    });

    it('should reject booking for non-existent travel', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: 2,
          travelId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject booking when not enough seats available', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          seats: 5,
          travelId: fullyBookedTravelId, // Iceland is fully booked
        })
        .expect(409); // Conflict - not enough seats

      expect(response.body).toHaveProperty('message');
      expect(response.body.message.toLowerCase()).toContain('available');
    });

    it('should reject booking with missing fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test@example.com',
          // Missing seats and travelId
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return booking by ID', async () => {
      // First create a booking
      const createResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-get@example.com',
          seats: 1,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      // Then fetch it
      const response = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      const booking = response.body.data;
      const meta = response.body.meta;

      expect(booking).toHaveProperty('id', bookingId);
      expect(booking).toHaveProperty('email', 'integration-test-get@example.com');
      expect(booking).toHaveProperty('seats', 1);
      expect(booking).toHaveProperty('status', 'PENDING');

      // meta should contain remainingTime for PENDING bookings
      expect(meta).toHaveProperty('remainingTime');
      expect(meta.remainingTime).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/bookings/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/bookings/not-a-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('id');
    });
  });

  describe('POST /api/bookings/:id/confirm', () => {
    it('should confirm a pending booking with payment', async () => {
      // First create a booking
      const createResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-confirm@example.com',
          seats: 2,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      // Then confirm it
      const response = await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/confirm`)
        .send({
          paymentMethod: 'fake',
        })
        .expect(201); // 201 Created for creating payment

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      const booking = response.body.data;
      const meta = response.body.meta;

      expect(booking).toHaveProperty('id', bookingId);
      expect(booking).toHaveProperty('status', 'CONFIRMED');

      // payment is now in meta
      expect(meta).toHaveProperty('payment');
      expect(meta.payment).toHaveProperty('status', 'completed');
      expect(meta.payment).toHaveProperty('transactionId');
      expect(meta.payment.transactionId).toBeTruthy();
    });

    it('should reject confirmation with invalid payment method', async () => {
      // First create a booking
      const createResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-invalid-payment@example.com',
          seats: 1,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      // Try to confirm with invalid payment method
      const response = await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/confirm`)
        .send({
          paymentMethod: 'credit-card',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject confirmation of non-existent booking', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/00000000-0000-0000-0000-000000000000/confirm')
        .send({
          paymentMethod: 'fake',
        })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject confirmation with invalid UUID format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/bookings/not-a-uuid/confirm')
        .send({
          paymentMethod: 'fake',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('id');
    });

    it('should reject double confirmation of already confirmed booking', async () => {
      // First create and confirm a booking
      const createResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-double-confirm@example.com',
          seats: 1,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/confirm`)
        .send({
          paymentMethod: 'fake',
        })
        .expect(201);

      // Try to confirm again
      const response = await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/confirm`)
        .send({
          paymentMethod: 'fake',
        })
        .expect(409); // Conflict - already confirmed

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel a pending booking', async () => {
      // First create a booking
      const createResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-cancel@example.com',
          seats: 1,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      // Then cancel it
      const response = await request(app.getHttpServer())
        .delete(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('id', bookingId);
      expect(response.body.data).toHaveProperty('status', 'CANCELLED');
      expect(response.body.message).toContain('cancelled');

      // Verify it's cancelled
      const getResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(getResponse.body.data.status).toBe('CANCELLED');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/bookings/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/bookings/not-a-uuid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('id');
    });

    it('should reject cancellation of already confirmed booking', async () => {
      // First create and confirm a booking
      const createResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-cancel-confirmed@example.com',
          seats: 1,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/confirm`)
        .send({
          paymentMethod: 'fake',
        })
        .expect(201);

      // Try to cancel
      const response = await request(app.getHttpServer())
        .delete(`/api/bookings/${bookingId}`)
        .expect(409); // Conflict - already confirmed

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Full booking flow', () => {
    it('should complete full booking flow: reserve -> confirm', async () => {
      // Step 1: Reserve a booking
      const reserveResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-flow@example.com',
          seats: 3,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = reserveResponse.body.data.id;
      expect(reserveResponse.body.data.status).toBe('PENDING');

      // Step 2: Get the booking
      const getResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(getResponse.body.data.id).toBe(bookingId);
      expect(getResponse.body.data.status).toBe('PENDING');

      // Step 3: Confirm with payment
      const confirmResponse = await request(app.getHttpServer())
        .post(`/api/bookings/${bookingId}/confirm`)
        .send({
          paymentMethod: 'fake',
        })
        .expect(201);

      expect(confirmResponse.body.data.status).toBe('CONFIRMED');
      expect(confirmResponse.body.meta.payment).toBeDefined();
      expect(confirmResponse.body.meta.payment.status).toBe('completed');

      // Step 4: Verify final state
      const finalGetResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(finalGetResponse.body.data.status).toBe('CONFIRMED');
    });

    it('should complete full booking flow: reserve -> cancel', async () => {
      // Step 1: Reserve a booking
      const reserveResponse = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'integration-test-flow-cancel@example.com',
          seats: 1,
          travelId: testTravelId,
        })
        .expect(201);

      const bookingId = reserveResponse.body.data.id;
      expect(reserveResponse.body.data.status).toBe('PENDING');

      // Step 2: Cancel the booking
      const cancelResponse = await request(app.getHttpServer())
        .delete(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(cancelResponse.body).toHaveProperty('data');
      expect(cancelResponse.body).toHaveProperty('message');
      expect(cancelResponse.body.data.status).toBe('CANCELLED');

      // Step 3: Verify cancellation persists
      const getResponse = await request(app.getHttpServer())
        .get(`/api/bookings/${bookingId}`)
        .expect(200);

      expect(getResponse.body.data.status).toBe('CANCELLED');
    });
  });

  describe('Concurrency and race conditions', () => {
    it('should prevent overbooking when multiple users book simultaneously', async () => {
      // Get a travel with limited seats (Paris has 5 seats, all available)
      const travelResponse = await request(app.getHttpServer())
        .get('/api/travels/paris-romance')
        .expect(200);

      const parisId = travelResponse.body.data.id;
      const availableSeats = travelResponse.body.meta.availableSeats;
      expect(availableSeats).toBe(5);

      // Simulate 10 concurrent users trying to book 1 seat each
      // Only 5 should succeed, 5 should fail with 409 Conflict
      const concurrentRequests = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .post('/api/bookings/reserve')
          .send({
            email: `concurrent-user-${i}@example.com`,
            seats: 1,
            travelId: parisId,
          }),
      );

      // Execute all requests concurrently
      const results = await Promise.allSettled(concurrentRequests);

      // Count successful (201) and failed (409) requests
      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 201);
      const conflicts = results.filter((r) => r.status === 'fulfilled' && r.value.status === 409);

      // Exactly 5 should succeed (available seats)
      expect(successful.length).toBe(5);
      // Exactly 5 should fail with conflict
      expect(conflicts.length).toBe(5);

      // Verify all successful bookings
      successful.forEach((result) => {
        if (result.status === 'fulfilled') {
          expect(result.value.body).toHaveProperty('data');
          expect(result.value.body.data.status).toBe('PENDING');
        }
      });

      // Verify all conflicts have proper error message
      conflicts.forEach((result) => {
        if (result.status === 'fulfilled') {
          expect(result.value.body).toHaveProperty('message');
          expect(result.value.body.message.toLowerCase()).toContain('available');
        }
      });

      // Verify the travel is now fully booked
      const finalTravelResponse = await request(app.getHttpServer())
        .get('/api/travels/paris-romance')
        .expect(200);

      expect(finalTravelResponse.body.meta.availableSeats).toBe(0);
    });

    it('should handle race condition with different seat counts', async () => {
      // Use Ibiza (5 seats available, no bookings)
      const travelResponse = await request(app.getHttpServer())
        .get('/api/travels/ibiza-summer')
        .expect(200);

      const ibizaId = travelResponse.body.data.id;
      expect(travelResponse.body.meta.availableSeats).toBe(5);

      // Simulate 3 users trying to book: 2 seats, 2 seats, 2 seats (total 6, only 5 available)
      const requests = [
        request(app.getHttpServer()).post('/api/bookings/reserve').send({
          email: 'race-user-1@example.com',
          seats: 2,
          travelId: ibizaId,
        }),
        request(app.getHttpServer()).post('/api/bookings/reserve').send({
          email: 'race-user-2@example.com',
          seats: 2,
          travelId: ibizaId,
        }),
        request(app.getHttpServer()).post('/api/bookings/reserve').send({
          email: 'race-user-3@example.com',
          seats: 2,
          travelId: ibizaId,
        }),
      ];

      const results = await Promise.allSettled(requests);

      const successful = results.filter((r) => r.status === 'fulfilled' && r.value.status === 201);
      const conflicts = results.filter((r) => r.status === 'fulfilled' && r.value.status === 409);

      // 2 should succeed (4 seats booked), 1 should fail (would need 2 but only 1 left)
      expect(successful.length).toBe(2);
      expect(conflicts.length).toBe(1);

      // Verify only 1 seat remains
      const finalResponse = await request(app.getHttpServer())
        .get('/api/travels/ibiza-summer')
        .expect(200);

      expect(finalResponse.body.meta.availableSeats).toBe(1);
    });

    it('should properly lock and release when booking expires', async () => {
      // This test verifies that expired PENDING bookings don't count towards available seats
      // We already have this scenario in seed data (Tokyo with expired booking)
      const tokyoResponse = await request(app.getHttpServer())
        .get('/api/travels/tokyo-cherry-blossoms')
        .expect(200);

      const tokyoId = tokyoResponse.body.data.id;
      // Tokyo should have 5 available seats despite having 1 expired PENDING booking
      expect(tokyoResponse.body.meta.availableSeats).toBe(5);

      // Should be able to book all 5 seats
      const booking = await request(app.getHttpServer())
        .post('/api/bookings/reserve')
        .send({
          email: 'concurrent-expired-test@example.com',
          seats: 5,
          travelId: tokyoId,
        })
        .expect(201);

      expect(booking.body.data.status).toBe('PENDING');
      expect(booking.body.data.seats).toBe(5);

      // Now should be fully booked
      const finalResponse = await request(app.getHttpServer())
        .get('/api/travels/tokyo-cherry-blossoms')
        .expect(200);

      expect(finalResponse.body.meta.availableSeats).toBe(0);
    });
  });
});
