FROM node:20 AS builder

WORKDIR /build
COPY . .

RUN npm install
RUN npm run build

FROM node:20-alpine AS runner

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /build/.next/standalone .
COPY --from=builder --chown=nextjs:nodejs /build/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /build/.next/server ./.next/server
COPY --from=builder /build/public ./public

# next/image optimization requires the native `sharp` library at runtime in
# standalone mode. Install only sharp (musl build) into a temp prefix and merge
# it into the standalone node_modules, leaving the traced dependency tree intact.
RUN npm install --omit=dev --prefix /tmp/sharp sharp@0.33.5 \
  && cp -a /tmp/sharp/node_modules/. ./node_modules/ \
  && rm -rf /tmp/sharp \
  && chown -R nextjs:nodejs ./node_modules

RUN chown nextjs:nodejs ./.next

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "./server.js"]
