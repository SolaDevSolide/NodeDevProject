# Development Environment
FROM node:22 AS development

WORKDIR /backend
COPY package.json ./
RUN npm install
COPY . .

# Install nodemon for watching files
RUN npm install -g nodemon

CMD ["nodemon", "src/index.ts"]

# Production Environment
FROM node:22 AS production

WORKDIR /backend
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npx tsc

CMD ["node", "dist/index.js"]
