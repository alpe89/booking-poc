# BOOKING-POC

A travel booking system with seat availability management and time-limited cart expiration.

## Use Case

Implement a checkout process for users to buy a Travel where:

- the user can select a travel to book;
- the user inputs an email and the number of seats to reserve;
- the user pays the total amount to confirm the booking (FAKE payment step);

### Requirements

- A Travel has a max capacity of 5 seats total;
- After confirming the number of seats to reserve the availability should be granted for 15 minutes before the cart expires;

**Note:** Implementing a back-office or the integration with a real payment provider is NOT a requirement.

---

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type safety and better DX
- **PostgreSQL** - Relational database
- **Prisma** - ORM for type-safe database access and rapid development
- **REST API** - API architecture (GraphQL as future extension)

### Frontend

- **Nuxt 3** - Vue.js framework with SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Nuxt UI** - Component library for rapid development with built-in accessibility

### Infrastructure

- **Docker & Docker Compose** - Containerization and orchestration
- **pnpm Workspaces** - Monorepo management
- **PostgreSQL** - Containerized database

---

## Architecture Overview

### Monorepo Structure

The project uses **pnpm workspaces** to manage a simple and lightweight monorepo:

```text
booking-poc/
├── package.json                 # Root package with workspace scripts
├── pnpm-workspace.yaml          # Workspaces configuration
├── docker-compose.yml           # Services orchestration
├── .dockerignore
├── .gitignore
├── README.md
├── samples/
│   └── travels.json            # Sample data for seeding
└── packages/
    ├── backend/                # NestJS API
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── src/
    │   │   ├── modules/
    │   │   │   ├── booking/    # Booking Domain (Core)
    │   │   │   ├── travel/     # Travel Domain (Supporting)
    │   │   │   └── payment/    # Payment Domain (Generic)
    │   │   ├── shared/
    │   │   ├── app.module.ts
    │   │   └── main.ts
    │   └── test/
    │
    └── frontend/               # Nuxt 3 App
        ├── Dockerfile
        ├── package.json
        ├── pages/
        ├── features/
        │   ├── travel/
        │   ├── booking/
        │   └── payment/
        └── shared/
```

### Why pnpm Workspaces?

For a POC of this size, this project uses **pnpm workspaces** instead of more complex tools like NX or Turborepo because:

- ✅ **Simplicity**: Zero extra configuration, immediate setup
- ✅ **Native**: No additional dependencies or boilerplate
- ✅ **Sufficient**: Perfect for 2 packages (backend + frontend)
- ✅ **Readable**: Clean code without complex tooling overhead

### Why REST instead of GraphQL?

GraphQL could be added later. The project starts with REST because:

- ✅ Faster to implement for a POC
- ✅ Less setup and initial configuration
- ✅ Simpler for project evaluators
- ✅ Easy migration to GraphQL in the future

### Docker Compose Services

```yaml
services:
  postgres:      # PostgreSQL Database (port 5432)
  backend:       # NestJS API (port 3000)
  frontend:      # Nuxt 3 App (port 3001)
  swagger-ui:    # API Documentation (port 8080)
```

---

## Database Schema

**Core entities:** `travels` and `bookings`

**Travels table:** Stores travel information (name, description, dates, price, moods) with fixed `totalSeats` of 5.

**Bookings table:** Tracks reservations with status (`pending`, `confirmed`, `expired`, `cancelled`), email, seats count, and `expiresAt` timestamp for pending bookings.

**Key implementation details:**

- Availability calculated real-time by summing all `pending` + `confirmed` bookings per travel
- Concurrency handled with database transactions and row-level locking (`FOR UPDATE`)
- Proper indexing on `(travelId, status)` and `expiresAt` for performance

---

## REST API Documentation

Complete API documentation is available in OpenAPI 3.0 format:

**📄 [openapi.yaml](openapi.yaml)** - Full API specification with:

- All endpoints (Travels, Bookings)
- Request/Response schemas
- Validation rules
- Error responses
- Interactive documentation via Swagger UI

### API Overview

**Travels:**

- `GET /api/travels` - List all travels (with pagination)
- `GET /api/travels/:slug` - Get travel details with availability

**Bookings:**

- `POST /api/bookings/reserve` - Reserve seats (creates pending booking)
- `GET /api/bookings/:id` - Get booking details with remaining time
- `POST /api/bookings/:id/confirm` - Confirm booking with fake payment
- `DELETE /api/bookings/:id` - Cancel pending booking

### Swagger UI

When running the application with Docker Compose, access interactive API documentation at:

**🔗 <http://localhost:8080>**

You can test all endpoints directly from the browser.

---

## Setup & Installation

### Prerequisites

- **Docker** and **Docker Compose**
- **pnpm** (optional, for local development)
- **Node.js >=22.19** (optional, for local development)

### Quick Start with Docker

```bash
# Clone repository
git clone <repository-url>
cd booking-poc

# Start all services
docker-compose up

# Or with rebuild
docker-compose up --build
```

Available services:

- **Frontend**: <http://localhost:3001>
- **Backend API**: <http://localhost:3000>
- **Swagger UI**: <http://localhost:8080>
- **PostgreSQL**: localhost:5432

### Local Development (without Docker)

```bash
# Install dependencies for all workspaces
pnpm install

# Start only PostgreSQL with Docker
docker-compose up postgres

# In separate terminals:
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:3001
```

---

## Development Workflow

### Available pnpm Scripts

```bash
# Development
pnpm dev              # Start Docker Compose (all services)
pnpm dev:backend      # Start only backend (local)
pnpm dev:frontend     # Start only frontend (local)

# Build
pnpm build            # Build all workspaces
pnpm build:backend    # Build only backend
pnpm build:frontend   # Build only frontend

# Testing
pnpm test             # Test all workspaces
pnpm test:backend     # Test only backend
pnpm test:frontend    # Test only frontend

# Linting
pnpm lint             # Lint all workspaces

# Database
pnpm db:seed          # Seed database with sample data
pnpm db:migrate       # Run migrations
pnpm db:reset         # Reset database
```

### How Workspaces Work

- `pnpm -r <command>` → Runs the command in **all** workspaces
- `pnpm --filter <name> <command>` → Runs the command **only** in the specified workspace
- `pnpm install` → Installs dependencies for all workspaces with intelligent hoisting

---

## Testing Strategy

### Backend Testing

- **Unit Tests**: Business logic (services, utilities)
- **Integration Tests**: REST endpoints with in-memory database
- **E2E Tests**: Complete booking flow
- **Concurrency Tests**: Simultaneous booking scenarios

### Frontend Testing

- **Component Tests**: Vitest for Vue components
- **E2E Tests**: Playwright for complete user flows

---

## Evaluation Points

As required by the specification, the project focuses on:

- ✅ **Code Quality**: TypeScript strict mode, linting, formatting
- ✅ **Code Readability**: Naming conventions, clear structure, comments where needed
- ✅ **Testing**: Adequate coverage with unit, integration and E2E tests
- ✅ **Solution Architecture**: Scalable, maintainable, separation of concerns
- ✅ **Reasoning**: Documented decisions (ADR) and commented
- ✅ **Documentation**: Complete README, API docs, inline comments
- ✅ **UI/UX Patterns**: Responsive design, loading states, error handling, user feedback

---

## Architecture Decision Records (ADR)

### ADR-001: Monorepo with pnpm Workspaces

**Context**: Need to manage backend and frontend in a single repository.

**Decision**: Use pnpm workspaces instead of NX or Turborepo.

**Rationale**: For a POC with 2 packages, pnpm workspaces offers simplicity without sacrificing functionality. Zero configuration overhead.

### ADR-002: REST API as Starting Point

**Context**: Choice between REST and GraphQL for APIs.

**Decision**: Start with REST, add GraphQL later.

**Rationale**: Faster implementation, less setup, not prior experience in the team (me), easy migration in the future. GraphQL can be added as a layer on top of REST.

### ADR-003: Docker Compose for Orchestration

**Context**: Need to run PostgreSQL, backend and frontend together.

**Decision**: Use Docker Compose for complete environment.

**Rationale**: Zero-configuration setup for project evaluators. Consistency across environments. Local development still possible.

### ADR-004: Expiration with Scheduled Job

**Context**: Handle booking expiration after 15 minutes.

**Decision**: Cron job that checks and expires bookings every minute.

**Rationale**: Simple, reliable, doesn't require external state. Alternative (DB-level TTL) considered but more complex.

### ADR-005: Prisma ORM for Database Layer

**Context**: Need to choose database access approach: TypeORM, Prisma, or no ORM.

**Decision**: Use Prisma ORM for the database layer.

**Rationale**: Type-safe client with excellent DX, reliable migrations, and minimal boilerplate. Perfect for POC velocity. Trade-off: vendor lock-in acceptable for this scale.

### ADR-006: Nuxt UI for Component Library

**Context**: Need UI components for frontend development.

**Decision**: Use Nuxt UI as the component library.

**Rationale**: Official Nuxt library with pre-built accessible components, form validation, and auto-import. Saves ~15-20 hours vs custom. Trade-off: ~100KB bundle size acceptable for POC.

### ADR-007: Domain-Driven Design Approach

**Context**: Need architectural pattern for organizing business logic maintainably.

**Decision**: Apply DDD principles with pragmatic simplification for POC scale.

**Rationale**: Backend organized by domain modules (booking, travel, payment). Entity-rich model with business logic. Repository pattern for testability. Simplified: flat structure, minimal Value Objects, no strict CQRS. Balance between DDD principles and development velocity.

---

## TODO List - Implementation Roadmap

### Phase 1: Infrastructure & Setup

- [x] Create monorepo structure with pnpm workspaces
  - [x] `pnpm-workspace.yaml`
  - [x] Root `package.json` with scripts
  - [ ] `packages/backend` and `packages/frontend` directories
- [ ] Setup Docker Compose
  - [x] `docker-compose.yml` with postgres, backend, frontend, swagger ui
  - [ ] Dockerfile for backend
  - [ ] Dockerfile for frontend
  - [ ] Volume for PostgreSQL persistence
- [ ] Environment configuration
  - [ ] `.env.example` files
  - [ ] `.dockerignore` and `.gitignore`

### Phase 2: Backend Implementation (NestJS with DDD structure)

- [ ] Initialize NestJS project in `packages/backend`
  - [ ] Setup TypeScript strict mode
  - [ ] Configure ESLint and Prettier
  - [ ] Create domain modules structure (booking, travel, payment)
- [ ] Database setup
  - [ ] Configure Prisma
  - [ ] Create Prisma schema for `travels` and `bookings`
  - [ ] Initial migrations
  - [ ] Seed script with `samples/travels.json`
- [ ] REST API - Travels
  - [ ] Controller and Service for travels
  - [ ] `GET /api/travels` with pagination
  - [ ] `GET /api/travels/:slug` with availability
  - [ ] DTO and input validation
- [ ] REST API - Bookings
  - [ ] Controller and Service for bookings
  - [ ] `POST /api/bookings/reserve` with transaction
  - [ ] `GET /api/bookings/:id` with remaining time
  - [ ] `POST /api/bookings/:id/confirm` (fake payment)
  - [ ] `DELETE /api/bookings/:id`
  - [ ] DTO and input validation
- [ ] Business Logic
  - [ ] Availability checking service
  - [ ] Reservation locking mechanism (optimistic/pessimistic)
  - [ ] Expiration scheduled job (cron)
  - [ ] Fake payment processing
- [ ] Backend Testing
  - [ ] Unit tests for services
  - [ ] Integration tests for endpoints
  - [ ] E2E test for complete flow
  - [ ] Concurrency tests

### Phase 3: Frontend Implementation (Nuxt 3)

- [ ] Initialize Nuxt 3 project in `packages/frontend`
  - [ ] Setup TypeScript
  - [ ] Configure Tailwind CSS
  - [ ] Install and configure Nuxt UI
  - [ ] Configure ESLint and Prettier
- [ ] Pages
  - [ ] `/` - Travel listing page
  - [ ] `/travels/:slug` - Travel detail & booking form
  - [ ] `/checkout/:bookingId` - Checkout with countdown
  - [ ] `/confirmation/:bookingId` - Booking confirmation
- [ ] Components
  - [ ] `TravelCard` - Card for travel list
  - [ ] `TravelDetail` - Travel details
  - [ ] `BookingForm` - Booking form (email + seats)
  - [ ] `CountdownTimer` - Visual 15-minute timer
  - [ ] `PaymentForm` - Fake payment form
  - [ ] `AvailabilityBadge` - Available seats indicator
- [ ] Composables
  - [ ] `useTravels()` - Fetch travels
  - [ ] `useBooking()` - Booking flow management
  - [ ] `useCountdown()` - Countdown timer logic
- [ ] API Integration
  - [ ] API client setup with `$fetch`
  - [ ] Type-safe API calls
  - [ ] Global error handling
  - [ ] Loading states
- [ ] UI/UX
  - [ ] Responsive design (mobile-first)
  - [ ] Loading skeletons
  - [ ] User-friendly error messages
  - [ ] Success feedback
  - [ ] Visual form validation
- [ ] Frontend Testing
  - [ ] Component tests with Vitest
  - [ ] E2E tests with Playwright

### Phase 4: Testing & Quality

- [ ] Test Coverage
  - [ ] Backend coverage > 80%
  - [ ] Frontend coverage > 70%
- [ ] E2E Testing
  - [ ] Complete flow: selection → booking → payment → confirmation
  - [ ] Cart expiration test
  - [ ] Concurrent bookings test
- [ ] Performance
  - [ ] API load testing
  - [ ] Frontend performance audit
  - [ ] Deadlock testing

### Phase 5: Documentation & Polish

- [ ] API Documentation
  - [ ] Swagger/OpenAPI for REST endpoints
  - [ ] Postman collection
- [ ] Code Documentation
  - [ ] JSDoc for complex functions
  - [ ] Inline comments for critical business logic
- [ ] User Documentation
  - [ ] Detailed setup instructions
  - [ ] Troubleshooting guide
  - [ ] Architecture diagrams
- [ ] Demo
  - [ ] Video demo or GIF of the flow
  - [ ] UI screenshots
  - [ ] Demo deployment (optional: Vercel + Railway/Render)

### Nice to Have (Future Extensions)

- [ ] GraphQL Layer on top of REST API
- [ ] Real-time availability updates (WebSocket)
- [ ] Email notifications (confirmation, expiration reminder)
- [ ] i18n (Italian/English)
- [ ] Rate limiting and throttling
- [ ] Caching layer (Redis)

---

## Contributing

This is a POC project. For changes or improvements, please open an issue for discussion before creating PRs.

## License

MIT
