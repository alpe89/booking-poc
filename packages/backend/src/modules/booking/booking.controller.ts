import { Controller, Get } from '@nestjs/common';
import { z } from 'zod';
import { BookingService } from './booking.service.js';
import { ZodParam } from '../../shared/decorators/zod-param.decorator.js';

const UuidSchema = z.string().uuid('Invalid UUID format');

@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':id')
  findById(@ZodParam(UuidSchema, 'id') id: string) {
    return this.bookingService.findById(id);
  }
}
