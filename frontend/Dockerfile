# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the production site
RUN npm run build

# Expose port
EXPOSE 4321

# Start a simple HTTP server to serve the production build
# First install a lightweight HTTP server
RUN npm install -g http-server

# Serve the production build from the dist directory
CMD ["http-server", "dist", "-p", "4321", "--cors"]