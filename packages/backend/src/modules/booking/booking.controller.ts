import { Controller, Get, Post, Delete } from '@nestjs/common';
import { z } from 'zod';
import { ZodParam } from '@shared/decorators/zod-param.decorator.js';
import { ZodBody } from '@shared/decorators/zod-body.decorator.js';
import { ApiResponse } from '@shared/decorators/api-response.decorator.js';
import { BookingService } from './booking.service.js';
import { ReserveBookingSchema, type ReserveBookingDto } from './dto/reserve-booking.dto.js';
import { ConfirmBookingSchema, type ConfirmBookingDto } from './dto/confirm-booking.dto.js';

const UuidSchema = z.uuid('Invalid UUID format');

@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('reserve')
  @ApiResponse({
    type: 'extract-meta',
    dataField: 'data',
    metaFields: ['expiresAt'],
  })
  reserve(@ZodBody(ReserveBookingSchema) dto: ReserveBookingDto) {
    return this.bookingService.reserve(dto);
  }

  @Get(':id')
  @ApiResponse({
    type: 'extract-meta',
    dataField: 'data',
    metaFields: ['remainingTime'],
  })
  findById(@ZodParam(UuidSchema, 'id') id: string) {
    return this.bookingService.findById(id);
  }

  @Post(':id/confirm')
  @ApiResponse({
    type: 'extract-meta',
    dataField: 'data',
    metaFields: ['payment'],
  })
  confirm(
    @ZodParam(UuidSchema, 'id') id: string,
    @ZodBody(ConfirmBookingSchema) dto: ConfirmBookingDto,
  ) {
    return this.bookingService.confirm(id, dto);
  }

  @Delete(':id')
  @ApiResponse({
    type: 'extract-meta',
    dataField: 'data',
    messageField: 'message',
  })
  cancel(@ZodParam(UuidSchema, 'id') id: string) {
    return this.bookingService.cancel(id);
  }
}
