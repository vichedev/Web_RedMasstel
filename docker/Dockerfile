# syntax=docker/dockerfile:1.7
# ───────────────────────────────────────────────────────────────────
#  Red MaasTel — Imagen de producción
# ───────────────────────────────────────────────────────────────────
#  El frontend (client/) se compila en local con `npm run web:build`,
#  que deja el resultado en public/ (se sube a git junto al código).
#
#  Multi-stage:
#    1) backend-build : compila el código NestJS (TS → JS)
#    2) production    : node:alpine con dist/, public/ y deps de prod
# ───────────────────────────────────────────────────────────────────

# ─── Stage 1: build del backend ────────────────────────────────────
FROM node:20-alpine AS backend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build


# ─── Stage 2: imagen final de producción ───────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    UPLOAD_DEST=/app/uploads

# tini → maneja señales (SIGTERM) correctamente para apagado limpio.
# curl  → para healthcheck.
RUN apk add --no-cache tini curl \
    && addgroup -S app && adduser -S app -G app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

# dist/ del backend (compilado en stage 1)
COPY --from=backend-build /app/dist ./dist

# public/ del frontend (ya buildeado en local — viene del contexto)
COPY public ./public

RUN mkdir -p /app/uploads \
    && chown -R app:app /app

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:3000/api/v1/branches >/dev/null || exit 1

# Entrypoint: corre migraciones y arranca la app. El auto-seed (super
# admin) ocurre dentro de NestJS al hacer bootstrap, así que no hay
# nada que hacer aquí aparte de migrar.
ENTRYPOINT ["/sbin/tini", "--"]
# -t each → cada migración decide si quiere transacción. Lo necesita
# AddHeroBrandLogos (ALTER TYPE ... ADD VALUE no puede ir en transacción).
CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -t each -d dist/database/data-source.js && node dist/main.js"]
