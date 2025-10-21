import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './shared/prisma/prisma.module.js';
import { TravelModule } from './modules/travel/travel.module.js';
import { BookingModule } from './modules/booking/booking.module.js';
import { ResponseTransformInterceptor } from './shared/interceptors/response-transform.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true, // Variables are loaded by dotenv-cli
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    TravelModule,
    BookingModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}
