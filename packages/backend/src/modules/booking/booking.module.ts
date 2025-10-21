import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller.js';
import { BookingService } from './booking.service.js';
import { BookingCleanupService } from './booking-cleanup.service.js';
import { PaymentModule } from '../payment/payment.module.js';

@Module({
  imports: [PaymentModule],
  controllers: [BookingController],
  providers: [BookingService, BookingCleanupService],
  exports: [BookingService],
})
export class BookingModule {}
