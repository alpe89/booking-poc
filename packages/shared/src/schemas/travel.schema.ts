import { z } from 'zod'

/**
 * Query parameters for GET /api/travels
 */
export const GetTravelsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export type GetTravelsQuery = z.infer<typeof GetTravelsQuerySchema>

/**
 * Query parameter for GET /api/travels/:slug
 */
export const SlugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens')

export type Slug = z.infer<typeof SlugSchema>
