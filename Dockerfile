FROM node:16-alpine
WORKDIR /app

ARG BOT_TOKEN
ARG PREFIX
RUN printf "BOT_TOKEN=${BOT_TOKEN}\nPREFIX=${PREFIX}" >> .env

RUN apk add --no-cache ffmpeg alpine-sdk automake libtool autoconf python3

COPY package*.json ./
RUN npm install

COPY . .
CMD [ "node", "index.js" ]