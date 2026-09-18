FROM node:24-bookworm-slim AS base

ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=oven/bun:1.3.14 /usr/local/bin/bun /usr/local/bin/bun

FROM base AS dependencies

RUN apt-get update \
    && apt-get install --no-install-recommends -y g++ make python3 \
    && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN bun run build \
    && bun build scripts/migrate.ts --target=node --external better-sqlite3 --outfile=.next/standalone/migrate.mjs \
    && cp -R migrations .next/standalone/migrations \
    && cp -R public .next/standalone/public \
    && cp -R .next/static .next/standalone/.next/static

FROM node:24-bookworm-slim AS runner

ENV HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    PORT=3000
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "node migrate.mjs && exec node server.js"]
