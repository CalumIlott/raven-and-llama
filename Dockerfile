FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY tailwind.config.js tailwind.input.css ./
COPY scripts/ ./scripts/
COPY public/ ./public/
RUN npm run build

FROM node:24-alpine

WORKDIR /app
COPY server.js ./
COPY lib/ ./lib/
COPY --from=build /app/public ./public/

# Persistent data directory
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
