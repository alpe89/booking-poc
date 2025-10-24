import { PrismaClient } from '../generated/prisma/index.js';
import { TRAVELS_DATA } from './seed-data.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const travelsData = TRAVELS_DATA;

  for (const travel of travelsData) {
    await prisma.travel.upsert({
      where: { id: travel.id },
      update: {},
      create: {
        id: travel.id,
        slug: travel.slug,
        name: travel.name,
        description: travel.description,
        startingDate: new Date(travel.startingDate),
        endingDate: new Date(travel.endingDate),
        price: travel.price,
        moods: travel.moods,
        totalSeats: 5,
      },
    });
    console.log(`✅ Created/Updated travel: ${travel.name}`);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
