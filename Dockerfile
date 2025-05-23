# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies with specific flags to ensure all dependencies are installed properly
RUN npm ci --legacy-peer-deps

# Copy the rest of the application
COPY ./ ./

# Build the application
RUN npm run build

# Start the application
RUN npm run dev