# Travel Booking Frontend

Frontend application built with Nuxt 4 and NuxtUI for the travel booking system.

## Tech Stack

- **Nuxt 4** - Vue.js framework
- **NuxtUI** - UI component library
- **TypeScript** - Type safety
- **Shared Package** - Shared types and schemas with backend via `@booking/shared`

## Features

- Browse available travels with pagination
- View travel details with mood indicators
- Reserve bookings with seat selection
- Confirm payments (fake payment in POC)
- Cancel bookings
- Auto-refresh booking status
- Dark mode support (via NuxtUI)

## Pages

- `/` - Travel listing page
- `/travels/[slug]` - Travel detail and booking page
- `/bookings/[id]` - Booking detail, confirmation, and cancellation page

## Development

```bash
# Install dependencies
pnpm install

# Run development server (on http://localhost:3001)
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

- `NUXT_PUBLIC_API_BASE` - Backend API base URL (default: `http://localhost:3000/api`)

## API Integration

The frontend uses a composable `useApi()` that provides type-safe API calls:

```typescript
const api = useApi()

// List travels
const travels = await api.travels.list({ page: 1, limit: 10 })

// Get travel by slug
const travel = await api.travels.getBySlug('iceland-adventure')

// Reserve booking
const booking = await api.bookings.reserve({
  email: 'user@example.com',
  seats: 2,
  travelId: 'uuid',
})

// Confirm booking
await api.bookings.confirm(bookingId, { paymentMethod: 'fake' })

// Cancel booking
await api.bookings.cancel(bookingId)
```

All types are shared with the backend via the `@booking/shared` package, ensuring type safety across the stack.
