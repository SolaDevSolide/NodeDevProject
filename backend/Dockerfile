# Development Environment
FROM node:20 AS development

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Install nodemon for watching files
RUN npm install -g nodemon

CMD ["nodemon", "src/index.ts"]

# Production Environment
FROM node:20 AS production

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npx tsc

CMD ["node", "dist/index.js"]
