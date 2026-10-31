FROM node:18-alpine

WORKDIR /app

# Copy application files
COPY index.html server.js ./
COPY css/ ./css/
COPY js/ ./js/
COPY assets/ ./assets/

# Persistent data directory
RUN mkdir -p /app/data
VOLUME ["/app/data"]

ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
