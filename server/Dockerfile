# Build stage
FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Production stage
FROM node:22-alpine as production-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build-stage /app/src ./src
COPY --from=build-stage /app/db ./db

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000
CMD ["node", "src/index.js"]
