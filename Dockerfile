# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time API origin.
# Next.js rewrites() di next.config.ts mem-bake `destination` URL ke
# .next/routes-manifest.json saat `next build` (bukan runtime), jadi nilai
# API_ORIGIN harus ada di build stage.
#
# Default fallback http://localhost:3001 cocok untuk `docker build` lokal
# tanpa flag. Di production / CI, override lewat:
#   docker compose build args (lihat docker-compose.prod.yml: chat-app-fe.build.args.API_ORIGIN)
#   atau: docker build --build-arg API_ORIGIN=http://chat-app-be:3001 .
#
# Tetap di-set sebagai ENV juga supaya kode lain yang baca process.env.API_ORIGIN
# di runtime (mis. server actions, route handlers) dapat nilai yang sama.
ARG API_ORIGIN=http://localhost:3001
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV API_ORIGIN=$API_ORIGIN
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
