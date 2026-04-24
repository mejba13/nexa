## syntax=docker/dockerfile:1.7
# Nexa API — Railway-friendly multi-stage build.
# Builds inside the monorepo so workspace packages (@nexa/types, @nexa/validators,
# @nexa/config) link correctly. Pruned production image runs `node dist/main.js`.

FROM node:22.13-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate
WORKDIR /repo
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV TURBO_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=1

# ============ DEPS ============
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/validators/package.json packages/validators/
COPY packages/config/package.json packages/config/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ============ BUILD ============
FROM deps AS build
COPY . .
RUN pnpm --filter @nexa/api prisma:generate
RUN pnpm --filter @nexa/api build

# ============ PRUNE ============
FROM deps AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# ============ RUNTIME ============
FROM node:22.13-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV API_PORT=3001

# Copy compiled output + production deps + Prisma client artifacts.
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/apps/api/prisma ./prisma
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=prod-deps /repo/apps/api/node_modules ./apps-api-node_modules
RUN cp -R apps-api-node_modules/. node_modules/ && rm -rf apps-api-node_modules

# Drop privileges
RUN addgroup -S nexa && adduser -S nexa -G nexa
USER nexa

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --spider http://localhost:3001/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
