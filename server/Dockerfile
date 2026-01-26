FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy prisma schema BEFORE npm ci
COPY prisma ./prisma

# Install dependencies (this will run prisma generate via postinstall)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript to JavaScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "dist/index.js"]