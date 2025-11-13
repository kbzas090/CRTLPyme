# Ultra-simple Dockerfile - no user switching, minimal complexity
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat openssl curl

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application using Next.js start
CMD ["npm", "start"]
