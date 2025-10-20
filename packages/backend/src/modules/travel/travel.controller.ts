import { Controller, Get, Param } from '@nestjs/common';
import { TravelService } from './travel.service.js';
import { GetTravelsQuery, GetTravelsQuerySchema } from './dto/travel.dto.js';
import { ZodQuery } from '../../shared/decorators/zod-query.decorator.js';

@Controller('api/travels')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Get()
  findAll(@ZodQuery(GetTravelsQuerySchema) query: GetTravelsQuery) {
    return this.travelService.findAll(query);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.travelService.findBySlug(slug);
  }
}
