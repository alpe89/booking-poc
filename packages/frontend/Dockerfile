# Base image reused across stages
FROM node:22-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# Install dependencies (dev + prod)
FROM base AS deps

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder

COPY --from=deps /app/ ./

COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend

WORKDIR /app
RUN pnpm --filter @booking/shared... run build

WORKDIR /app/packages/frontend
RUN pnpm build

# Production image
FROM node:22-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod --filter frontend... --filter @booking/shared...

COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/packages/frontend

COPY --from=builder /app/packages/frontend/.output ./.output
COPY --from=builder /app/packages/frontend/nuxt.config.ts ./nuxt.config.ts

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]
