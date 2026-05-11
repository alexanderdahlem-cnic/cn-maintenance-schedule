# Development-only image: Vite dev server with hot reload.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

EXPOSE 80

# Vite listens on 80 inside the container; map host 8000:80 in compose.
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0 --port 80"]
