# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.10.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

WORKDIR /

ENV NODE_ENV="production"


FROM base as build

RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

COPY --link package-lock.json package.json ./
RUN npm ci

RUN npx playwright install chromium
RUN npx playwright install-deps

COPY --link . .


FROM base

COPY --from=build / /

EXPOSE 3000
CMD [ "npm", "run", "start" ]
