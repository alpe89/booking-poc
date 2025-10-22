/**
 * Model types exported from Prisma
 * These will be re-exported from the backend package
 */

// These types will be provided by the backend
// For now we define them manually to match Prisma schema
export type Travel = {
  id: string
  slug: string
  name: string
  description: string
  startingDate: Date
  endingDate: Date
  price: number
  moods: {
    nature: number
    relax: number
    history: number
    culture: number
    party: number
  }
  totalSeats: number
  createdAt: Date
  updatedAt: Date
}

export type Booking = {
  id: string
  travelId: string
  email: string
  seats: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type Payment = {
  id: string
  bookingId: string
  amount: number
  status: 'SUCCESS' | 'FAILED'
  transactionId: string
  errorCode: string | null
  cardLast4: string
  createdAt: Date
  updatedAt: Date
}

// Serialized versions for JSON transport (dates as strings)
export type TravelSerialized = Omit<Travel, 'startingDate' | 'endingDate' | 'createdAt' | 'updatedAt'> & {
  startingDate: string
  endingDate: string
  createdAt: string
  updatedAt: string
}

export type BookingSerialized = Omit<Booking, 'expiresAt' | 'createdAt' | 'updatedAt'> & {
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}
