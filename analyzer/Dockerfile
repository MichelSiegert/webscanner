# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM ghcr.io/puppeteer/puppeteer:latest
USER root
WORKDIR /app

RUN chown -R pptruser:pptruser /app
USER pptruser
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]