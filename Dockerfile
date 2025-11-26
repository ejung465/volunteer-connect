# THIS IS THE CORRECT DOCKERFILE CONTENT FOR YOUR PROJECT STRUCTURE

# --- STAGE 1: FRONTEND BUILDER ---
FROM node:22-alpine as frontend-builder
WORKDIR /app

# Copy files needed for the frontend build (package.json, config, source)
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY index.html ./
COPY src ./src

# Install dependencies and build the frontend (output goes to /app/dist)
RUN npm ci 
# This runs the 'build' script defined in your root package.json
RUN npm run build 

# ----------------------------------------------------------------------

# --- STAGE 2: FINAL PRODUCTION SERVER ---
# Use a fresh, clean Node.js image for the backend runtime.
FROM node:22
WORKDIR /app

# Copy the static files (the "dist" folder) from Stage 1 into the new image.
# The output is expected in /app/dist
COPY --from=frontend-builder /app/dist ./dist

# Install ONLY the necessary production dependencies for the Express backend
# Copy files needed for root-level and server-level dependencies
COPY package*.json ./
COPY server/package*.json ./server/

# Install root dependencies, then install server dependencies inside the 'server' folder
# 1. Install root dependencies
RUN npm ci --omit=dev 

# 2. Install server dependencies using a guaranteed shell (The Fix!)
# This ensures 'cd' is recognized
RUN /bin/sh -c "cd server && npm ci --omit=dev"




# Copy the rest of the Express backend source code
COPY server ./server

# Configure the runtime environment
ENV NODE_ENV=production
# Inform Docker that the application listens on port 3001
EXPOSE 3001 

# The command to run when the container starts
CMD ["node", "server/server.js"]