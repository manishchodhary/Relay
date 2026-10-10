FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/typescript-config ./packages/typescript-config

COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/prisma.config.ts ./packages/db/prisma.config.ts
COPY packages/db/tsconfig.json ./packages/db/tsconfig.json

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/db ./packages/db

RUN DATABASE_URI="postgresql://placeholder:placeholder@localhost:5432/placeholder" pnpm --filter @repo/db db:generate
RUN pnpm --filter @repo/db build
RUN pnpm --filter api build

FROM base AS production

ENV NODE_ENV=production

COPY --from=build /app /app

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["node", "dist/server.js"]
