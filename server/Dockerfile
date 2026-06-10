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
COPY --from=build-stage /app/uploads ./uploads

RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000
CMD ["node", "src/index.js"]
