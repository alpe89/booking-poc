-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "travels" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startingDate" DATE NOT NULL,
    "endingDate" DATE NOT NULL,
    "price" INTEGER NOT NULL,
    "moods" JSONB NOT NULL,
    "totalSeats" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "travels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "travelId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "seatsCount" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "travels_slug_key" ON "travels"("slug");

-- CreateIndex
CREATE INDEX "travels_slug_idx" ON "travels"("slug");

-- CreateIndex
CREATE INDEX "bookings_travelId_status_idx" ON "bookings"("travelId", "status");

-- CreateIndex
CREATE INDEX "bookings_expiresAt_idx" ON "bookings"("expiresAt");

-- CreateIndex
CREATE INDEX "bookings_email_idx" ON "bookings"("email");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_travelId_fkey" FOREIGN KEY ("travelId") REFERENCES "travels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
