import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@shared/prisma/prisma.service.js';
import { BookingStatus } from '@database/index.js';

@Injectable()
export class BookingCleanupService {
  private readonly logger = new Logger(BookingCleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cleanup expired PENDING bookings every 6 hours
   * Runs at: 00:00, 06:00, 12:00, 18:00
   */
  @Cron('0 */6 * * *')
  async cleanupExpiredBookings() {
    const now = new Date();

    const result = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING,
        expiresAt: { lt: now },
      },
      data: {
        status: BookingStatus.EXPIRED,
      },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} expired bookings as EXPIRED`);
    }
  }
}
