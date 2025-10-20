import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { BookingStatus } from '../../../generated/prisma/index.js';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException({
        error: 'Booking not found',
        message: `No booking found with id '${id}'`,
      });
    }

    const remainingTime = this.calculateRemainingTime(booking.status, booking.expiresAt);

    return {
      data: booking,
      remainingTime,
    };
  }

  private calculateRemainingTime(status: BookingStatus, expiresAt: Date | null): number | null {
    // Only PENDING bookings have expiration time
    if (status !== BookingStatus.PENDING || !expiresAt) {
      return null;
    }

    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();

    // Return seconds remaining (0 if already expired)
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
}
