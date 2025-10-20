import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { BookingStatus } from '../../../generated/prisma/index.js';

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;

  const mockBookings = [
    {
      id: 'b1234567-1234-1234-1234-123456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'test@example.com',
      seats: 2,
      totalAmount: 399800,
      status: BookingStatus.PENDING,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'b2234567-2234-2234-2234-223456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'confirmed@example.com',
      seats: 1,
      totalAmount: 199900,
      status: BookingStatus.CONFIRMED,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'b3234567-3234-3234-3234-323456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'expired@example.com',
      seats: 3,
      totalAmount: 599700,
      status: BookingStatus.EXPIRED,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'b4234567-4234-4234-4234-423456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'cancelled@example.com',
      seats: 1,
      totalAmount: 199900,
      status: BookingStatus.CANCELLED,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      booking: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findById', () => {
    it('should return a booking with remainingTime when status is PENDING', async () => {
      const mockBooking = mockBookings[0];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(mockBooking);

      const result = await service.findById(mockBooking.id);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('remainingTime');
      expect(result.data).toEqual(mockBooking);
      expect(result.remainingTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.remainingTime).toBe('number');
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
      });
      expect(prisma.booking.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(null);

      await expect(service.findById(nonExistentId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(nonExistentId)).rejects.toThrow(
        `No booking found with id '${nonExistentId}'`,
      );
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });

    it('should return null remainingTime for CONFIRMED status', async () => {
      const confirmedBooking = mockBookings[1];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(confirmedBooking);

      const result = await service.findById(confirmedBooking.id);

      expect(result.data).toEqual(confirmedBooking);
      expect(result.data.status).toBe(BookingStatus.CONFIRMED);
      expect(result.remainingTime).toBeNull();
    });

    it('should return null remainingTime for EXPIRED status', async () => {
      const expiredBooking = mockBookings[2];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(expiredBooking);

      const result = await service.findById(expiredBooking.id);

      expect(result.data).toEqual(expiredBooking);
      expect(result.data.status).toBe(BookingStatus.EXPIRED);
      expect(result.remainingTime).toBeNull();
    });

    it('should return null remainingTime for CANCELLED status', async () => {
      const cancelledBooking = mockBookings[3];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(cancelledBooking);

      const result = await service.findById(cancelledBooking.id);

      expect(result.data).toEqual(cancelledBooking);
      expect(result.data.status).toBe(BookingStatus.CANCELLED);
      expect(result.remainingTime).toBeNull();
    });

    it('should return 0 remainingTime when PENDING booking has expired', async () => {
      const expiredPendingBooking = {
        ...mockBookings[0],
        expiresAt: new Date(Date.now() - 1000), // 1 second ago
      };
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(expiredPendingBooking);

      const result = await service.findById(expiredPendingBooking.id);

      expect(result.data.status).toBe(BookingStatus.PENDING);
      expect(result.remainingTime).toBe(0);
    });

    it('should handle bookings with different seats values', async () => {
      const booking = { ...mockBookings[0], seats: 5, totalAmount: 999500 };
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(booking);

      const result = await service.findById(booking.id);

      expect(result.data.seats).toBe(5);
      expect(result.data.totalAmount).toBe(999500);
    });

    it('should return booking with correct email format', async () => {
      const booking = mockBookings[0];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(booking);

      const result = await service.findById(booking.id);

      expect(result.data.email).toBe('test@example.com');
      expect(result.data.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should return null remainingTime when PENDING booking has no expiresAt', async () => {
      const pendingWithoutExpiry = {
        ...mockBookings[0],
        expiresAt: null,
      };
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(pendingWithoutExpiry);

      const result = await service.findById(pendingWithoutExpiry.id);

      expect(result.data.status).toBe(BookingStatus.PENDING);
      expect(result.remainingTime).toBeNull();
    });
  });
});
