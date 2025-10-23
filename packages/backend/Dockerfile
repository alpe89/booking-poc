# Base image reused across stages
FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# Install dependencies (dev + prod)
FROM base AS deps

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Builder stage (also exposed for prisma-studio target)
FROM base AS builder

COPY --from=deps /app/ ./

COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

WORKDIR /app
RUN pnpm --filter @booking/shared... run build

WORKDIR /app/packages/backend

RUN pnpm prisma generate
RUN pnpm --filter backend run build

# Production image
FROM node:22-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod --filter backend... --filter @booking/shared...

COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/packages/backend

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/generated ./generated
COPY --from=builder /app/packages/backend/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main.js"]
