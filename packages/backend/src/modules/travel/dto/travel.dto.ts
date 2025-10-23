import { z } from 'zod';
import { GetTravelsQuerySchema, type GetTravelsQuery, SlugSchema, type Slug } from '@booking/shared';

// Re-export from shared package
export { GetTravelsQuerySchema, type GetTravelsQuery, SlugSchema, type Slug };

// Response schema for GET /api/travels
export const TravelSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  startingDate: z.date(),
  endingDate: z.date(),
  price: z.number().int().min(0),
  moods: z.object({
    nature: z.number().int().min(0).max(100),
    relax: z.number().int().min(0).max(100),
    history: z.number().int().min(0).max(100),
    culture: z.number().int().min(0).max(100),
    party: z.number().int().min(0).max(100),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Travel = z.infer<typeof TravelSchema>;

// Response for GET /api/travels
export const GetTravelsResponseSchema = z.object({
  data: z.array(TravelSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type GetTravelsResponse = z.infer<typeof GetTravelsResponseSchema>;

// Response for GET /api/travels/:slug
export const GetTravelBySlugResponseSchema = z.object({
  data: TravelSchema,
  availableSeats: z.number().int().min(0).max(5),
});

export type GetTravelBySlugResponse = z.infer<typeof GetTravelBySlugResponseSchema>;
