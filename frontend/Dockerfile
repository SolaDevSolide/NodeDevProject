# Development Environment
FROM node:22 AS development

WORKDIR /frontend
COPY package.json /frontend/
RUN npm install
RUN npm install -g @angular/cli@latest
COPY . /frontend

RUN ng update

EXPOSE 4200

CMD ng serve --host 0.0.0.0
