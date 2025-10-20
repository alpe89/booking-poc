import { Controller, Get, Param } from '@nestjs/common';
import { BookingService } from './booking.service.js';

@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.bookingService.findById(id);
  }
}
