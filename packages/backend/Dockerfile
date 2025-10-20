# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copy workspace and backend package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install all dependencies (workspace root + backend)
RUN pnpm install --frozen-lockfile --filter backend...

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/backend ./packages/backend

# Generate Prisma Client
WORKDIR /app/packages/backend
RUN pnpm prisma generate

# Build application
RUN pnpm build

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copy workspace and backend package files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --filter backend...

# Change to backend directory
WORKDIR /app/packages/backend

# Copy built application from builder
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/generated ./generated
COPY --from=builder /app/packages/backend/prisma ./prisma

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
