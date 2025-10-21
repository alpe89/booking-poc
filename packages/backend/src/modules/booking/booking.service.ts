import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service.js';
import { BookingStatus, PaymentStatus, type Travel } from '@database/index.js';
import { PaymentService } from '../payment/payment.service.js';
import { bookingConfig } from '@shared/config/booking.config.js';
import type { ReserveBookingDto } from './dto/reserve-booking.dto.js';
import type { ConfirmBookingDto } from './dto/confirm-booking.dto.js';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
  ) {}

  async reserve(dto: ReserveBookingDto) {
    return await this.prisma.$transaction(async (tx) => {
      // Lock travel row with FOR UPDATE to prevent concurrent booking race conditions
      const [travel] = await tx.$queryRaw<Pick<Travel, 'id' | 'totalSeats' | 'price'>[]>`
        SELECT id, "totalSeats", price
        FROM travels
        WHERE id = ${dto.travelId}
        FOR UPDATE
      `;

      if (!travel) {
        throw new NotFoundException({
          error: 'Travel not found',
          message: `No travel found with id '${dto.travelId}'`,
        });
      }

      // Calculate available seats (only count CONFIRMED + non-expired PENDING)
      const now = new Date();
      const bookedSeats = await tx.booking.aggregate({
        where: {
          travelId: dto.travelId,
          OR: [
            { status: BookingStatus.CONFIRMED },
            {
              status: BookingStatus.PENDING,
              expiresAt: { gt: now },
            },
          ],
        },
        _sum: { seats: true },
      });

      const totalBooked = bookedSeats._sum.seats ?? 0;
      const availableSeats = Math.max(0, travel.totalSeats - totalBooked);

      if (availableSeats < dto.seats) {
        throw new ConflictException({
          error: 'Not enough seats available',
          message: `Only ${availableSeats} seats available, requested ${dto.seats}`,
          availableSeats,
        });
      }

      const expiresAt = new Date(Date.now() + bookingConfig.expirationMinutes * 60 * 1000);
      const totalAmount = travel.price * dto.seats;

      const booking = await tx.booking.create({
        data: {
          email: dto.email,
          seats: dto.seats,
          travelId: dto.travelId,
          totalAmount,
          status: BookingStatus.PENDING,
          expiresAt,
        },
      });

      return {
        data: booking,
        expiresAt: expiresAt.toISOString(),
      };
    });
  }

  async confirm(id: string, _dto: ConfirmBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException({
        error: 'Booking not found',
        message: `No booking found with id '${id}'`,
      });
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException({
        error: 'Booking cannot be confirmed',
        message: `Booking is ${booking.status}, only PENDING bookings can be confirmed`,
        status: booking.status,
      });
    }

    // Check expiration and mark as EXPIRED if needed
    const now = new Date();
    if (booking.expiresAt && booking.expiresAt < now) {
      await this.prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.EXPIRED },
      });

      throw new ConflictException({
        error: 'Booking expired',
        message: 'This booking has expired and cannot be confirmed',
      });
    }

    const paymentResult = await this.paymentService.processFakePayment();

    if (!paymentResult.success) {
      throw new BadRequestException({
        error: 'Payment failed',
        message: paymentResult.errorCode,
        errorCode: paymentResult.errorCode,
      });
    }

    // Atomically update booking and create payment record
    const [confirmedBooking] = await this.prisma.$transaction([
      this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CONFIRMED,
          expiresAt: null,
        },
      }),
      this.prisma.payment.create({
        data: {
          bookingId: id,
          amount: booking.totalAmount,
          status: PaymentStatus.SUCCESS,
          transactionId: paymentResult.transactionId!,
          cardLast4: 'FAKE', // Fake payment - no real card
        },
      }),
    ]);

    return {
      data: confirmedBooking,
      payment: {
        transactionId: paymentResult.transactionId!,
        status: 'completed' as const,
        errorCode: null,
      },
    };
  }

  async cancel(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      throw new NotFoundException({
        error: 'Booking not found',
        message: `No booking found with id '${id}'`,
      });
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new ConflictException({
        error: 'Booking cannot be cancelled',
        message: `Only PENDING bookings can be cancelled, this booking is ${booking.status}`,
        status: booking.status,
      });
    }

    const cancelledBooking = await this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
    });

    return {
      data: cancelledBooking,
      message: 'Booking cancelled successfully',
    };
  }

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
    if (status !== BookingStatus.PENDING || !expiresAt) {
      return null;
    }

    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();

    return Math.max(0, Math.floor(remainingMs / 1000));
  }
}
