import { PrismaClient } from '../generated/prisma/index.js';

/**
 * Global setup for integration tests
 * Seeds test booking data that tests expect to be present
 */

const prisma = new PrismaClient();

// Initial booking data for integration tests
// These bookings represent the "baseline" state that tests expect
const TEST_BOOKINGS = [
  // Jordan: 2 confirmed bookings (2 seats booked, 3 available out of 5)
  {
    id: 'test-booking-jordan-1',
    email: 'seed-user1@example.com',
    seats: 1,
    travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d', // jordan-360
    status: 'CONFIRMED' as const,
    totalAmount: 199900,
    expiresAt: null,
    confirmedAt: new Date('2021-10-15T10:00:00Z'),
    createdAt: new Date('2021-10-15T09:00:00Z'),
    updatedAt: new Date('2021-10-15T10:00:00Z'),
  },
  {
    id: 'test-booking-jordan-2',
    email: 'seed-user2@example.com',
    seats: 1,
    travelId: 'd408be33-aa6a-4c73-a2c8-58a70ab2ba4d', // jordan-360
    status: 'CONFIRMED' as const,
    totalAmount: 199900,
    expiresAt: null,
    confirmedAt: new Date('2021-10-16T10:00:00Z'),
    createdAt: new Date('2021-10-16T09:00:00Z'),
    updatedAt: new Date('2021-10-16T10:00:00Z'),
  },
  // Iceland: 2 confirmed bookings (5 seats total = fully booked, 0 available)
  {
    id: 'test-booking-iceland-1',
    email: 'seed-user3@example.com',
    seats: 2,
    travelId: '4f4bd032-e7d4-402a-bdf6-aaf6be240d53', // iceland-northern-lights
    status: 'CONFIRMED' as const,
    totalAmount: 399800,
    expiresAt: null,
    confirmedAt: new Date('2021-10-15T11:00:00Z'),
    createdAt: new Date('2021-10-15T10:00:00Z'),
    updatedAt: new Date('2021-10-15T11:00:00Z'),
  },
  {
    id: 'test-booking-iceland-2',
    email: 'seed-user4@example.com',
    seats: 3,
    travelId: '4f4bd032-e7d4-402a-bdf6-aaf6be240d53', // iceland-northern-lights
    status: 'CONFIRMED' as const,
    totalAmount: 599700,
    expiresAt: null,
    confirmedAt: new Date('2021-10-16T11:00:00Z'),
    createdAt: new Date('2021-10-16T10:00:00Z'),
    updatedAt: new Date('2021-10-16T11:00:00Z'),
  },
];

async function setupTestBookings() {
  console.log('🧪 Setting up test booking data...');

  try {
    // Insert test bookings (using upsert to be idempotent)
    for (const booking of TEST_BOOKINGS) {
      await prisma.booking.upsert({
        where: { id: booking.id },
        update: {}, // Don't update if exists
        create: booking,
      });
    }

    console.log(`✅ Created ${TEST_BOOKINGS.length} test bookings`);
  } catch (error) {
    console.error('❌ Failed to setup test bookings:', error);
    throw error;
  }
}

// Run setup before all tests
await setupTestBookings();
await prisma.$disconnect();
