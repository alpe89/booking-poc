import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service.js';

@Injectable()
export class BookingService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.booking.findUnique({
      where: { id },
    });
  }
}
