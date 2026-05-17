# syntax=docker/dockerfile:1.7
# ============================================================
# Pizza Height API — multi-stage build for Railway / Render / Fly
# ============================================================

# ------------ Base image (shared by every stage) ------------
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl tini
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

# ------------ Dependency installation ------------
FROM base AS deps
WORKDIR /repo

# Copy only what's needed to resolve the dependency graph so this layer
# stays cached across source changes.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json apps/api/
COPY packages ./packages

# NOTE: pnpm cache mount was removed — Railway's Metal builder rejects
# unscoped `id=` arguments and requires an "s/<cacheKey>/..." prefix that
# doesn't transfer back to local Docker BuildKit. Plain install works
# everywhere; CI builds eat ~30s extra fetch time but it's not the hot path.
RUN pnpm install --frozen-lockfile --filter @pizza-height/api...

# ------------ Build (compile TypeScript + Prisma client) ------------
FROM base AS build
WORKDIR /repo

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/api/node_modules ./apps/api/node_modules

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/api ./apps/api

WORKDIR /repo/apps/api
RUN pnpm prisma:generate
RUN pnpm build

# ------------ Production runtime ------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

# Non-root user — safer if the container is ever exec'd into
RUN addgroup -S nodejs && adduser -S api -G nodejs

# pnpm's apps/api/node_modules is a tree of symlinks into the workspace-root
# node_modules/.pnpm store. We must preserve that exact layout in the image
# or every `require('@nestjs/...')` blows up with MODULE_NOT_FOUND.
#
# Keep the /repo/{apps/api,node_modules,packages,package.json,pnpm-workspace.yaml}
# structure intact, then `cd /repo/apps/api` to run.
WORKDIR /repo

COPY --from=build --chown=api:nodejs /repo/node_modules ./node_modules
COPY --from=build --chown=api:nodejs /repo/package.json /repo/pnpm-workspace.yaml ./
COPY --from=build --chown=api:nodejs /repo/packages ./packages
COPY --from=build --chown=api:nodejs /repo/apps/api/dist ./apps/api/dist
COPY --from=build --chown=api:nodejs /repo/apps/api/package.json ./apps/api/
COPY --from=build --chown=api:nodejs /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build --chown=api:nodejs /repo/apps/api/node_modules ./apps/api/node_modules

WORKDIR /repo/apps/api
USER api
EXPOSE 4000

# `tini` reaps zombies and forwards signals so Node shuts down cleanly
# when the orchestrator sends SIGTERM (Railway / Fly do this on deploys).
ENTRYPOINT ["/sbin/tini", "--"]

# Run pending migrations, then start the API. If the migration fails the
# container exits non-zero and the orchestrator will roll back.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/main"]
