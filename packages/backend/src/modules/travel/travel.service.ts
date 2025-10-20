import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { GetTravelsQuery } from './dto/travel.dto.js';
import { BookingStatus } from '../../../generated/prisma/index.js';

@Injectable()
export class TravelService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetTravelsQuery) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [travels, total] = await Promise.all([
      this.prisma.travel.findMany({
        orderBy: { startingDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.travel.count(),
    ]);

    return {
      data: travels,
      total,
      page,
      limit,
    };
  }

  async findBySlug(slug: string) {
    const travel = await this.prisma.travel.findUnique({
      where: { slug },
    });

    if (!travel) {
      throw new NotFoundException({
        error: 'Travel not found',
        message: `No travel found with slug '${slug}'`,
      });
    }

    // Calculate available seats
    const availableSeats = await this.calculateAvailableSeats(travel.id, travel.totalSeats);

    return {
      data: travel,
      availableSeats,
    };
  }

  private async calculateAvailableSeats(travelId: string, totalSeats: number): Promise<number> {
    // Count confirmed and pending bookings
    const bookedSeats = await this.prisma.booking.aggregate({
      where: {
        travelId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
        },
      },
      _sum: {
        seats: true,
      },
    });

    const { _sum: seatsSum } = bookedSeats;
    const totalBooked = seatsSum?.seats ?? 0;

    return Math.max(0, totalSeats - totalBooked);
  }
}
