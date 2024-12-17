# Stage 1: Development Environment
FROM node:20 AS development

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Start Angular in watch mode
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]

# Production Environment
FROM node:20 AS production

WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npm run build --prod

CMD ["npx", "http-server", "dist/frontend", "-p", "4200"]

