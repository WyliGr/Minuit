FROM node:22-slim AS base

ENV TZ=UTC

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --ignore-ts-errors && npm prune --omit=dev

FROM node:22-slim AS runtime

ENV NODE_ENV=production
ENV TZ=UTC
ENV PORT=3333
ENV HOST=0.0.0.0

WORKDIR /app

COPY --from=base /app/build ./build
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/database ./database

RUN mkdir -p /app/database

EXPOSE 3333

CMD ["sh", "-c", "node build/ace.js migration:run --force && node build/ace.js db:seed && node build/bin/server.js"]