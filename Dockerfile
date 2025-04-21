# ---------- Base Stage ----------
FROM node:18-alpine AS base

# Install necessary packages
RUN apk add --no-cache g++ make py3-pip libc6-compat

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Copy Prisma schema
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Expose application port
EXPOSE 3000

# ---------- Builder Stage ----------
FROM base AS builder

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# ---------- Production Stage ----------
FROM base AS production

# Set environment variable for production
ENV NODE_ENV=production

# Reinstall only production dependencies
RUN npm ci --only=production

# Create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Set user to non-root
USER nextjs

# Copy necessary files from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Start the application
CMD ["npm", "start"]

# ---------- Development Stage ----------
FROM base AS dev

# Set environment variable for development
ENV NODE_ENV=development

# Install all dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Start the development server
CMD ["npm", "run", "dev"]
