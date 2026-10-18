FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# Vite bakes these into the bundle at build time
ARG VITE_API_URL=http://localhost:8000
ARG VITE_DEMO_LOGIN=
ENV VITE_API_URL=$VITE_API_URL VITE_DEMO_LOGIN=$VITE_DEMO_LOGIN
RUN npm run build

# Runs as the unprivileged nginx user, so it listens on 8080 instead of 80
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
