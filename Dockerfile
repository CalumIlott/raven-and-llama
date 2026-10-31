FROM node:22-alpine

WORKDIR /app

# Copy application files
COPY server.js ./
COPY lib/ ./lib/
COPY public/ ./public/

# Persistent data directory
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
