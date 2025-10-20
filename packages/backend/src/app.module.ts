import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { TravelModule } from './modules/travel/travel.module.js';
import { BookingModule } from './modules/booking/booking.module.js';

@Module({
  imports: [PrismaModule, TravelModule, BookingModule],
})
export class AppModule {}
