import { Controller, Get } from '@nestjs/common';
import { TravelService } from './travel.service.js';
import type { GetTravelsQuery } from './dto/travel.dto.js';
import { GetTravelsQuerySchema, SlugSchema } from './dto/travel.dto.js';
import { ZodQuery } from '@shared/decorators/zod-query.decorator.js';
import { ZodParam } from '@shared/decorators/zod-param.decorator.js';
import { ApiResponse } from '@shared/decorators/api-response.decorator.js';

@Controller('api/travels')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Get()
  @ApiResponse({
    type: 'extract-meta',
    dataField: 'data',
    metaFields: ['total', 'page', 'limit'],
  })
  findAll(@ZodQuery(GetTravelsQuerySchema) query: GetTravelsQuery) {
    return this.travelService.findAll(query);
  }

  @Get(':slug')
  @ApiResponse({
    type: 'extract-meta',
    dataField: 'data',
    metaFields: ['availableSeats'],
  })
  findBySlug(@ZodParam(SlugSchema, 'slug') slug: string) {
    return this.travelService.findBySlug(slug);
  }
}
