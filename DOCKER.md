# Docker Configuration Guide

This document explains the Docker setup for the booking-poc project.

## Overview

The project includes two Docker Compose configurations:

1. **`docker-compose.yml`** - Production mode with optimized builds
2. **`docker-compose.dev.yml`** - Development mode with hot-reload and volume mounts

## Services

### PostgreSQL Database
- **Container**: `booking-postgres`
- **Port**: 5432
- **Image**: postgres:15-alpine
- **Data**: Persisted in `postgres-data` volume
- **Health check**: Automatic with retry

### Backend API (NestJS)
- **Container**: `booking-backend` (production) / `booking-backend-dev` (development)
- **Port**: 3000
- **Context**: Root directory (to access shared package)
- **Dockerfile**: `packages/backend/Dockerfile`
- **Multi-stage build**:
  - Stage 1 (deps): Install dependencies
  - Stage 2 (builder): Build application
  - Stage 3 (production): Production-ready image

### Frontend (Nuxt 4)
- **Container**: `booking-frontend` (production) / `booking-frontend-dev` (development)
- **Port**: 3001
- **Context**: Root directory (to access shared package)
- **Dockerfile**: `packages/frontend/Dockerfile`
- **Multi-stage build**:
  - Stage 1 (deps): Install dependencies
  - Stage 2 (builder): Build application
  - Stage 3 (production): Production-ready image

### Swagger UI
- **Container**: `booking-swagger-ui`
- **Port**: 8080
- **Image**: swaggerapi/swagger-ui:latest
- **Volume**: Mounts `openapi.yaml` for API documentation

### Prisma Studio
- **Container**: `booking-prisma-studio`
- **Port**: 5555
- **Build**: Uses builder stage from backend Dockerfile
- **Purpose**: Database GUI management

## Usage

### Production Mode

Optimized builds with no source code mounting:

```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Development Mode

Hot-reload enabled with source code mounted:

```bash
# Start all services with hot-reload
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

### Individual Services

Start specific services:

```bash
# Production
docker-compose up postgres backend
docker-compose up frontend

# Development
docker-compose -f docker-compose.dev.yml up postgres backend
```

## Dockerfile Details

### Backend Dockerfile

**Location**: `packages/backend/Dockerfile`

**Key features**:
- Multi-stage build (deps → builder → production)
- Includes `@booking/shared` package
- Generates Prisma client during build
- Production-only dependencies in final image
- Runs database migrations on startup (TODO)

**Stages**:
1. **deps**: Install all workspace dependencies
2. **builder**: Build application and generate Prisma client
3. **production**: Minimal production image with built artifacts

### Frontend Dockerfile

**Location**: `packages/frontend/Dockerfile`

**Key features**:
- Multi-stage build (deps → builder → production)
- Includes `@booking/shared` package
- Builds Nuxt application with SSR
- Production-only dependencies in final image
- Exposes port 3000 internally

**Stages**:
1. **deps**: Install all workspace dependencies
2. **builder**: Build Nuxt application
3. **production**: Minimal production image with `.output` directory

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
POSTGRES_USER=booking
POSTGRES_PASSWORD=booking123
POSTGRES_DB=booking
DATABASE_URL=postgresql://booking:booking123@postgres:5432/booking

# Backend
PORT=3000
NODE_ENV=production

# Frontend
NUXT_PUBLIC_API_BASE=http://backend:3000/api
```

**Note**: In production mode, frontend uses `http://backend:3000/api` (internal Docker network). In local development, use `http://localhost:3000/api`.

## .dockerignore Files

### Root `.dockerignore`
Excludes common files like `node_modules`, `.git`, logs, etc.

### Backend `.dockerignore`
Excludes build outputs, test files, and development artifacts.

### Frontend `.dockerignore`
Excludes `.nuxt`, `.output`, and other build artifacts.

## Volume Mounts

### Production Mode
- **PostgreSQL**: `postgres-data:/var/lib/postgresql/data` (persistent)
- **Swagger UI**: `./openapi.yaml:/openapi/openapi.yaml:ro` (read-only)

### Development Mode
- **Backend**:
  - `./packages/backend/src:/app/packages/backend/src`
  - `./packages/backend/prisma:/app/packages/backend/prisma`
  - `./packages/shared:/app/packages/shared`
- **Frontend**:
  - `./packages/frontend:/app/packages/frontend`
  - `./packages/shared:/app/packages/shared`
  - Anonymous volumes for `node_modules` and `.nuxt`

## Network

All services use the default bridge network created by Docker Compose. Services can communicate using their service names as hostnames (e.g., `postgres`, `backend`, `frontend`).

## Troubleshooting

### Backend cannot connect to database

Check that PostgreSQL is healthy:
```bash
docker-compose ps
docker-compose logs postgres
```

### Frontend cannot reach backend

Verify environment variables:
```bash
# Inside frontend container
docker-compose exec frontend env | grep NUXT_PUBLIC_API_BASE
```

### Build fails with "Cannot find module"

Rebuild with no cache:
```bash
docker-compose build --no-cache
```

### Port already in use

Check if ports are occupied:
```bash
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

Stop conflicting services or change ports in `docker-compose.yml`.

### Shared package changes not reflected

Rebuild the affected service:
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

## Best Practices

1. **Use `.env` file** for environment-specific configuration
2. **Production mode** for testing deployment
3. **Development mode** for active development
4. **Volume mounts** only in development to avoid performance issues
5. **Multi-stage builds** to keep final images small
6. **Health checks** for database to ensure proper startup order
7. **Anonymous volumes** for `node_modules` to avoid host/container conflicts

## Performance

### Build Time Optimization
- Dependencies cached in separate stage
- Only relevant files copied (via .dockerignore)
- Workspace-aware dependency installation

### Runtime Optimization
- Production stage uses `--prod` flag
- No dev dependencies in final image
- Minimal layers for faster image pulls

### Development Experience
- Hot-reload enabled in dev mode
- Source code mounted for instant changes
- No need to rebuild for code changes
