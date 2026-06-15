FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .
COPY server/package.json ./server/
COPY webui/package.json ./webui/

RUN npm install

COPY server/ ./server/
COPY webui/ ./webui/

RUN npm run build -w webui
RUN npm run build -w server

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/static ./server/static
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "server/dist/index.js"]
