FROM node:16-alpine
WORKDIR /app

RUN apk add --no-cache ffmpeg alpine-sdk automake libtool autoconf python3

COPY package*.json ./
RUN npm install

COPY . .

ARG BOT_TOKEN
ARG PREFIX
ENV BOT_TOKEN=$BOT_TOKEN
ENV PREFIX=$PREFIX

CMD [ "node", "index.js" ]