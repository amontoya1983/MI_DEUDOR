# Multi-stage Dockerfile for MI DEUDOR
# Production-ready Node.js runtime

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build Vite client and bundle Express server with esbuild
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built application and required production files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
