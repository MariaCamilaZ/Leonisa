# Build estático con Vite y servido con nginx en :80 (el proxy de Coolify rutea a :80 por defecto).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# 127.0.0.1 y no localhost: en Alpine localhost resuelve primero a ::1.
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:80/ || exit 1
