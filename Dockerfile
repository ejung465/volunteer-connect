# --- STAGE 1: FRONTEND BUILDER ---
FROM node:22-alpine as frontend-builder
WORKDIR /app

# Copy files needed for the frontend build (package.json, src, vite config, ts config)
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Install dependencies and build the frontend (output goes to /app/dist)
RUN npm ci 
RUN npm run build 
# ... rest of the Dockerfile ...

# --- STAGE 2: FINAL PRODUCTION SERVER ---
# Use a fresh, clean Node.js image for the backend runtime.
FROM node:22-alpine
WORKDIR /app

# Copy the static files (the "dist" folder) from Stage 1 into the new image.
COPY --from=frontend-builder /app/dist ./dist

# Install ONLY the necessary production dependencies for the Express backend
# Copy only the files needed to install backend dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm ci --omit=dev && cd server && npm ci --omit=dev && cd ..

# Copy the rest of the Express backend source code
COPY server ./server

# Configure the runtime environment
ENV NODE_ENV=production
# Inform Docker that the application listens on port 3001
EXPOSE 3001 

# The command to run when the container starts
CMD ["node", "server/server.js"]