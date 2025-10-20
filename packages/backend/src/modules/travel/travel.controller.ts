import { Controller, Get } from '@nestjs/common';
import { z } from 'zod';
import { TravelService } from './travel.service.js';
import type { GetTravelsQuery } from './dto/travel.dto.js';
import { GetTravelsQuerySchema } from './dto/travel.dto.js';
import { ZodQuery } from '../../shared/decorators/zod-query.decorator.js';
import { ZodParam } from '../../shared/decorators/zod-param.decorator.js';

const SlugSchema = z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

@Controller('api/travels')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Get()
  findAll(@ZodQuery(GetTravelsQuerySchema) query: GetTravelsQuery) {
    return this.travelService.findAll(query);
  }

  @Get(':slug')
  findBySlug(@ZodParam(SlugSchema, 'slug') slug: string) {
    return this.travelService.findBySlug(slug);
  }
}
