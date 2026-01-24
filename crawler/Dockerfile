FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY .env .env 
EXPOSE 3000
CMD ["npm", "start"]
