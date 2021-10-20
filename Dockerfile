FROM node:16-alpine

LABEL org.opencontainers.image.authors="fabien.lavocat@dolby.com"

WORKDIR /usr/src/www

COPY package*.json ./

RUN npm_config_platform='darwin' npm_config_arch='x64' npm install

COPY . .

RUN npm run docker

EXPOSE 8081

CMD [ "node", "server/index.js", "--port", "8081" ]
