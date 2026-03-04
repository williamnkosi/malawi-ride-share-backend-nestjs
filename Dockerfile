# ================================
# Build Stage
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy package files and yarn config
COPY package.json yarn.lock .yarnrc.yml ./

# Install all dependencies (including devDependencies for build)
RUN yarn install --immutable

# Copy source code
COPY . .

# Clean build - remove any stale build cache
RUN rm -rf dist *.tsbuildinfo

# Build the application
RUN yarn build

# Prune dev dependencies after build
RUN yarn workspaces focus --all --production || true

# ================================
# Production Stage
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built application and production node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "dist/main.js"]
