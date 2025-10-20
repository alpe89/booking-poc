import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service.js';
import { PrismaService } from '../../shared/prisma/prisma.service.js';
import { BookingStatus } from '../../../generated/prisma/index.js';

describe('BookingService', () => {
  let service: BookingService;
  let prisma: PrismaService;

  const mockTravel = {
    id: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
    slug: 'jordan-360',
    name: 'Jordan 360°',
    description: 'Jordan 360°: the perfect tour...',
    startingDate: new Date('2021-11-01'),
    endingDate: new Date('2021-11-09'),
    price: 199900,
    moods: { nature: 80, relax: 20, history: 90, culture: 30, party: 10 },
    totalSeats: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBookings = [
    {
      id: 'b1234567-1234-1234-1234-123456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'test@example.com',
      seatsCount: 2,
      status: BookingStatus.PENDING,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'b2234567-2234-2234-2234-223456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'confirmed@example.com',
      seatsCount: 1,
      status: BookingStatus.CONFIRMED,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'b3234567-3234-3234-3234-323456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'expired@example.com',
      seatsCount: 3,
      status: BookingStatus.EXPIRED,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'b4234567-4234-4234-4234-423456789012',
      travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d',
      email: 'cancelled@example.com',
      seatsCount: 1,
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
    it('should return a booking when it exists', async () => {
      const mockBooking = mockBookings[0];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(mockBooking);

      const result = await service.findById(mockBooking.id);

      expect(result).toEqual(mockBooking);
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: mockBooking.id },
      });
      expect(prisma.booking.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null when booking does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(null);

      const result = await service.findById(nonExistentId);

      expect(result).toBeNull();
      expect(prisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: nonExistentId },
      });
    });

    it('should return a booking with CONFIRMED status', async () => {
      const confirmedBooking = mockBookings[1];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(confirmedBooking);

      const result = await service.findById(confirmedBooking.id);

      expect(result).toEqual(confirmedBooking);
      expect(result?.status).toBe(BookingStatus.CONFIRMED);
      expect(result?.expiresAt).toBeNull();
    });

    it('should return a booking with PENDING status', async () => {
      const pendingBooking = mockBookings[0];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(pendingBooking);

      const result = await service.findById(pendingBooking.id);

      expect(result).toEqual(pendingBooking);
      expect(result?.status).toBe(BookingStatus.PENDING);
      expect(result?.expiresAt).toBeDefined();
    });

    it('should return a booking with EXPIRED status', async () => {
      const expiredBooking = mockBookings[2];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(expiredBooking);

      const result = await service.findById(expiredBooking.id);

      expect(result).toEqual(expiredBooking);
      expect(result?.status).toBe(BookingStatus.EXPIRED);
    });

    it('should return a booking with CANCELLED status', async () => {
      const cancelledBooking = mockBookings[3];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(cancelledBooking);

      const result = await service.findById(cancelledBooking.id);

      expect(result).toEqual(cancelledBooking);
      expect(result?.status).toBe(BookingStatus.CANCELLED);
    });

    it('should handle bookings with different seatsCount values', async () => {
      const booking = { ...mockBookings[0], seatsCount: 5 };
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(booking);

      const result = await service.findById(booking.id);

      expect(result?.seatsCount).toBe(5);
    });

    it('should return booking with correct email format', async () => {
      const booking = mockBookings[0];
      vi.spyOn(prisma.booking, 'findUnique').mockResolvedValue(booking);

      const result = await service.findById(booking.id);

      expect(result?.email).toBe('test@example.com');
      expect(result?.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });
});
