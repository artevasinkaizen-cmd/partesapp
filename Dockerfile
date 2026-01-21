FROM node:20-slim

WORKDIR /app

# Install dependencies first (caching)
COPY package.json ./
# We do NOT copy package-lock.json to avoid cross-platform binary issues
# And we clean up potential artifacts
RUN rm -rf node_modules package-lock.json && npm install

# Copy source code
COPY . .

# Expose ports for Vite and API
EXPOSE 5173 3001

# Default command (can be overridden in compose)
CMD ["npm", "run", "dev:docker"]
