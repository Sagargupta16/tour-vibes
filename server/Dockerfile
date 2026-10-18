FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
# Only what the API and the seed script need; tests and local files stay out
COPY app.js ./
COPY controllers ./controllers
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY util ./util
COPY scripts ./scripts
COPY seed ./seed
# Uploads land in /app/images, mounted as a volume by docker-compose.yml
RUN mkdir -p images && chown node:node images
USER node
EXPOSE 8000
CMD ["node", "app.js"]
