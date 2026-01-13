FROM node:24-alpine AS build-stage
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build-stage /app/dist/web-scan-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
