FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY . .
# Uploads land in /app/images, mounted as a volume by docker-compose.yml
RUN mkdir -p images && chown node:node images
USER node
EXPOSE 8000
CMD ["node", "app.js"]
