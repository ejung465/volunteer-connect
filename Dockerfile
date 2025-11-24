# --- STAGE 1: FRONTEND BUILDER ---
# Use a Node.js image to install all dependencies and build the React/Vite app.
FROM node:22-alpine as frontend-builder
WORKDIR /app

# Copy dependency files (for caching)
COPY package*.json ./
# Run 'npm ci' to install dependencies (including dev deps needed for the Vite build)
RUN npm ci 

# Copy the actual client code (assuming it's in a 'client' folder)
COPY client ./client
# Execute the Vite build command
RUN npm run build --prefix client

# --- STAGE 2: FINAL PRODUCTION SERVER ---
# Use a fresh, clean Node.js image. This image will NOT have the heavy build tools.
FROM node:22-alpine
WORKDIR /app

# Copy the static files (the "dist" folder) from Stage 1 into the new image.
# This is the ONLY thing we keep from the frontend-builder.
COPY --from=frontend-builder /app/client/dist ./dist

# Install ONLY the necessary production dependencies for the Express backend
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --omit=dev && cd server && npm ci --omit=dev && cd ..

# Copy the Express backend source code
COPY server ./server

# Configure the runtime environment
ENV NODE_ENV=production
# Inform Docker that the application listens on port 3001
EXPOSE 3001 

# The command to run when the container starts
CMD ["node", "server/server.js"]