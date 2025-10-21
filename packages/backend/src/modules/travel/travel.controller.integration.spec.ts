import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, type TestingModule } from '@nestjs/testing';
import { type INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../app.module.js';
import { ZodExceptionFilter } from '../../shared/filters/zod-exception.filter.js';

describe('TravelController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Register global exception filters
    app.useGlobalFilters(new ZodExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/travels', () => {
    it('should return paginated travels with default parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);

      const meta = response.body.meta;
      expect(meta).toHaveProperty('total', 5); // We seeded 5 travels
      expect(meta).toHaveProperty('page', 1);
      expect(meta).toHaveProperty('limit', 10);
      expect(response.body.data.length).toBe(5);
    });

    it('should return paginated travels with custom page and limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?page=1&limit=2')
        .expect(200);

      const meta = response.body.meta;
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(2);
      expect(meta.total).toBe(5);
      expect(response.body.data.length).toBe(2);
    });

    it('should handle pagination correctly (page 2)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?page=2&limit=2')
        .expect(200);

      const meta = response.body.meta;
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(2);
      expect(response.body.data.length).toBe(2);
    });

    it('should coerce string query parameters to numbers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?page=1&limit=3')
        .expect(200);

      const meta = response.body.meta;
      expect(typeof meta.page).toBe('number');
      expect(typeof meta.limit).toBe('number');
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(3);
    });

    it('should reject invalid page parameter (less than 1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?page=0')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid limit parameter (greater than 100)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?limit=101')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid limit parameter (less than 1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?limit=0')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject non-numeric page parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?page=invalid')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return travels with correct structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?limit=1')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      const travel = response.body.data[0];
      expect(travel).toHaveProperty('id');
      expect(travel).toHaveProperty('slug');
      expect(travel).toHaveProperty('name');
      expect(travel).toHaveProperty('description');
      expect(travel).toHaveProperty('startingDate');
      expect(travel).toHaveProperty('endingDate');
      expect(travel).toHaveProperty('price');
      expect(travel).toHaveProperty('moods');

      // Verify moods structure
      expect(travel.moods).toHaveProperty('nature');
      expect(travel.moods).toHaveProperty('relax');
      expect(travel.moods).toHaveProperty('history');
      expect(travel.moods).toHaveProperty('culture');
      expect(travel.moods).toHaveProperty('party');

      // Verify mood values are in valid range
      expect(travel.moods.nature).toBeGreaterThanOrEqual(0);
      expect(travel.moods.nature).toBeLessThanOrEqual(100);
    });

    it('should return specific test travel data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels?limit=10')
        .expect(200);

      // Verify we have our seeded data
      const jordanTravel = response.body.data.find((t: any) => t.slug === 'jordan-360');
      expect(jordanTravel).toBeDefined();
      expect(jordanTravel.name).toBe('Jordan 360°');
      expect(jordanTravel.price).toBe(199900);
    });
  });

  describe('GET /api/travels/:slug', () => {
    it('should return a travel by slug with available seats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/jordan-360')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data.slug).toBe('jordan-360');
      expect(response.body.data.name).toBe('Jordan 360°');

      const meta = response.body.meta;
      // Jordan has 2 seats booked, so 3 available
      expect(meta).toHaveProperty('availableSeats', 3);
      expect(typeof meta.availableSeats).toBe('number');
    });

    it('should return 0 available seats for fully booked travel', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/iceland-northern-lights')
        .expect(200);

      expect(response.body.data.slug).toBe('iceland-northern-lights');
      const meta = response.body.meta;
      // Iceland has 5 seats booked (fully booked)
      expect(meta.availableSeats).toBe(0);
    });

    it('should return 5 available seats for travel with no bookings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/paris-romance')
        .expect(200);

      expect(response.body.data.slug).toBe('paris-romance');
      const meta = response.body.meta;
      // Paris has no bookings
      expect(meta.availableSeats).toBe(5);
    });

    it('should return 5 available seats for travel with expired pending booking', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/tokyo-cherry-blossoms')
        .expect(200);

      expect(response.body.data.slug).toBe('tokyo-cherry-blossoms');
      const meta = response.body.meta;
      // Tokyo has 1 expired pending booking (should not count)
      expect(meta.availableSeats).toBe(5);
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/non-existent-slug-12345')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid slug format (uppercase)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/INVALID-SLUG')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid slug format (special characters)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/invalid_slug!')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid slug format (spaces)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/invalid slug')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should accept valid slug with numbers and hyphens', async () => {
      // This will return 404 but should pass validation
      const response = await request(app.getHttpServer())
        .get('/api/travels/valid-slug-123');

      // Either 200 (found) or 404 (not found), but not 400 (validation error)
      expect([200, 404]).toContain(response.status);
    });

    it('should return travel with all required fields', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/travels/jordan-360')
        .expect(200);

      const { data } = response.body;

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('slug', 'jordan-360');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('startingDate');
      expect(data).toHaveProperty('endingDate');
      expect(data).toHaveProperty('price');
      expect(data).toHaveProperty('moods');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');

      // Verify UUID format for id
      expect(data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
});
