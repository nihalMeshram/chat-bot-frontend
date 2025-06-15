# Stage 1: Build the Angular app
FROM node:22.12.0-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the app source code
COPY . .

# Build the Angular app for production
RUN npm run build -- --configuration=production

# Stage 2: Serve the Angular app using NGINX
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from builder
COPY --from=builder /app/dist/chat-bot-frontend/browser /usr/share/nginx/html

# Copy custom nginx config (optional, if you have one)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port (optional if behind reverse proxy)
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
