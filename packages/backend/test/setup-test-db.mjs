#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import Prisma client from custom output path
const { PrismaClient } = await import(resolve(__dirname, '../generated/prisma/index.js'));

const TEST_DATABASE_URL = 'postgresql://booking_test:booking_test@localhost:5433/booking_test?schema=public';

/**
 * Setup test database
 */
async function setupTestDb() {
  console.log('🚀 Setting up test database...\n');

  try {
    console.log('📋 Step 1: Running database migrations...');
    execSync('DATABASE_URL="' + TEST_DATABASE_URL + '" pnpm prisma migrate deploy', {
      cwd: resolve(__dirname, '..'),
      stdio: 'inherit',
    });
    console.log('✅ Migrations completed');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }

  // Create Prisma client with test database URL
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: TEST_DATABASE_URL,
      },
    },
  });

  try {
    console.log('\n📋 Step 2: Testing connection to test database...');
    await prisma.$connect();
    console.log('✅ Connected to test database');

    console.log('\n📋 Step 3: Cleaning existing data...');
    await prisma.booking.deleteMany();
    await prisma.travel.deleteMany();
    console.log('✅ Database cleaned');

    console.log('\n📋 Step 4: Seeding test database with controlled test data...');

    // Create test travels with known data
    const travel1 = await prisma.travel.create({
      data: {
        slug: 'jordan-360',
        name: 'Jordan 360°',
        description: 'Jordan 360°: the perfect tour to discover the suggestive Wadi Rum desert',
        startingDate: new Date('2024-12-01'),
        endingDate: new Date('2024-12-08'),
        price: 199900,
        moods: {
          nature: 80,
          relax: 20,
          history: 90,
          culture: 30,
          party: 10,
        },
      },
    });

    const travel2 = await prisma.travel.create({
      data: {
        slug: 'iceland-northern-lights',
        name: 'Iceland: Northern Lights',
        description: 'Experience the magic of the Northern Lights in Iceland',
        startingDate: new Date('2024-11-15'),
        endingDate: new Date('2024-11-22'),
        price: 249900,
        moods: {
          nature: 100,
          relax: 40,
          history: 20,
          culture: 30,
          party: 5,
        },
      },
    });

    const travel3 = await prisma.travel.create({
      data: {
        slug: 'tokyo-cherry-blossoms',
        name: 'Tokyo Cherry Blossoms',
        description: 'Discover Tokyo during the beautiful cherry blossom season',
        startingDate: new Date('2025-03-20'),
        endingDate: new Date('2025-03-27'),
        price: 299900,
        moods: {
          nature: 70,
          relax: 30,
          history: 60,
          culture: 90,
          party: 40,
        },
      },
    });

    const travel4 = await prisma.travel.create({
      data: {
        slug: 'paris-romance',
        name: 'Romantic Paris',
        description: 'A romantic getaway to the city of love',
        startingDate: new Date('2025-02-14'),
        endingDate: new Date('2025-02-18'),
        price: 149900,
        moods: {
          nature: 10,
          relax: 70,
          history: 50,
          culture: 80,
          party: 30,
        },
      },
    });

    const travel5 = await prisma.travel.create({
      data: {
        slug: 'ibiza-summer',
        name: 'Ibiza Summer Party',
        description: 'The ultimate party experience in Ibiza',
        startingDate: new Date('2025-07-01'),
        endingDate: new Date('2025-07-08'),
        price: 179900,
        moods: {
          nature: 20,
          relax: 10,
          history: 5,
          culture: 15,
          party: 100,
        },
      },
    });

    // Create some test bookings
    await prisma.booking.create({
      data: {
        travelId: travel1.id,
        email: 'test1@example.com',
        seats: 2,
        totalAmount: 199900 * 2, // price * seats
        status: 'CONFIRMED',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await prisma.booking.create({
      data: {
        travelId: travel2.id,
        email: 'test2@example.com',
        seats: 5,
        totalAmount: 249900 * 5,
        status: 'CONFIRMED',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await prisma.booking.create({
      data: {
        travelId: travel3.id,
        email: 'test3@example.com',
        seats: 1,
        totalAmount: 299900,
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000), // Already expired
      },
    });

    console.log('✅ Test data seeded successfully!');
    console.log('\n📊 Test data summary:');
    console.log('   - 5 travels created');
    console.log('   - 3 bookings created');
    console.log('\n📝 Test travels:');
    console.log('   1. jordan-360 (2 seats booked, 3 available)');
    console.log('   2. iceland-northern-lights (5 seats booked, 0 available - FULLY BOOKED)');
    console.log('   3. tokyo-cherry-blossoms (1 expired pending booking, 5 available)');
    console.log('   4. paris-romance (0 seats booked, 5 available)');
    console.log('   5. ibiza-summer (0 seats booked, 5 available)');

    console.log('\n✅ Test database setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Test database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDb();
