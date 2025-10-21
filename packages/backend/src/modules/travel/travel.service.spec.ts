import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TravelService } from './travel.service.js';
import { PrismaService } from '@shared/prisma/prisma.service.js';

describe('TravelService', () => {
  let service: TravelService;
  let prisma: PrismaService;

  const mockTravels = [
    {
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
    },
    {
      id: '4f4bd032-e7d4-402a-bdf6-aaf6be240d53',
      slug: 'iceland-hunting-northern-lights',
      name: 'Iceland: hunting for the Northern Lights',
      description: 'Why visit Iceland in winter?...',
      startingDate: new Date('2021-11-01'),
      endingDate: new Date('2021-11-08'),
      price: 199900,
      moods: { nature: 100, relax: 30, history: 10, culture: 20, party: 10 },
      totalSeats: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = {
      travel: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      booking: {
        aggregate: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TravelService>(TravelService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findAll', () => {
    it('should return paginated travels with correct format', async () => {
      vi.spyOn(prisma.travel, 'findMany').mockResolvedValue(mockTravels);
      vi.spyOn(prisma.travel, 'count').mockResolvedValue(2);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: mockTravels,
        total: 2,
        page: 1,
        limit: 10,
      });
      expect(prisma.travel.findMany).toHaveBeenCalledWith({
        orderBy: { startingDate: 'asc' },
        skip: 0,
        take: 10,
      });
      expect(prisma.travel.count).toHaveBeenCalledTimes(1);
    });

    it('should handle pagination correctly for page 2', async () => {
      vi.spyOn(prisma.travel, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.travel, 'count').mockResolvedValue(15);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result).toEqual({
        data: [],
        total: 15,
        page: 2,
        limit: 10,
      });
      expect(prisma.travel.findMany).toHaveBeenCalledWith({
        orderBy: { startingDate: 'asc' },
        skip: 10,
        take: 10,
      });
    });
  });

  describe('findBySlug', () => {
    it('should return a travel with available seats when found', async () => {
      const travel = mockTravels[0];
      vi.spyOn(prisma.travel, 'findUnique').mockResolvedValue(travel);
      vi.spyOn(prisma.booking, 'aggregate').mockResolvedValue({
        _sum: { seats: 2 },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });

      const result = await service.findBySlug('jordan-360');

      expect(result).toEqual({
        data: travel,
        availableSeats: 3, // 5 total - 2 booked
      });
      expect(prisma.travel.findUnique).toHaveBeenCalledWith({
        where: { slug: 'jordan-360' },
      });
    });

    it('should throw NotFoundException when travel not found', async () => {
      vi.spyOn(prisma.travel, 'findUnique').mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(NotFoundException);
    });

    it('should return all seats available when no bookings exist', async () => {
      const travel = mockTravels[0];
      vi.spyOn(prisma.travel, 'findUnique').mockResolvedValue(travel);
      vi.spyOn(prisma.booking, 'aggregate').mockResolvedValue({
        _sum: { seats: null },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });

      const result = await service.findBySlug('jordan-360');

      expect(result).toEqual({
        data: travel,
        availableSeats: 5,
      });
    });
  });
});
