# syntax=docker/dockerfile:1
# Build from the repo ROOT:  docker build -f docker/Dockerfile.be -t fincent-be .
# Runtime env (PORT, API_PREFIX, FE_URL, ...) is provided at `docker run` time —
# see apps/be/.env.example.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# ─── install + build ────────────────────────────────────────────────────────
FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter @repo/be build

# ─── runner ─────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app/apps/be

# pnpm stores real packages in the root node_modules/.pnpm; apps/be/node_modules
# holds symlinks into it. Copy BOTH (preserving paths) so the symlinks resolve.
COPY --from=build --chown=node:node /app/node_modules /app/node_modules
COPY --from=build --chown=node:node /app/apps/be/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/be/dist ./dist
COPY --from=build --chown=node:node /app/apps/be/package.json ./package.json

USER node
EXPOSE 8000
CMD ["node", "dist/main"]
