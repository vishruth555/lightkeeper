# ---- Base node image ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Install dependencies ----
FROM base AS deps
COPY package.json package-lock.json* yarn.lock* ./
RUN npm install

# ---- Build the Next.js app ----
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# ---- Production image ----
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Start Next.js production server
CMD ["npm", "start"]
