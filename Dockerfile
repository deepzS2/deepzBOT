FROM node:lts-alpine3.15 as build

# Python3 for node-gyp and build-essential
RUN apk add --no-cache python3 python3-dev build-base

WORKDIR /usr/src/app
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

FROM node:lts-alpine3.15 as runner

# PM2
RUN npm install pm2 -g
USER node

# Copy configuration files
WORKDIR /usr/src/app
COPY ecosystem.config.js prisma ./
COPY .env.production ./.env

# Copy from builder
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node --from=build /usr/src/app/package.json /usr/src/app/package.json
COPY --chown=node:node --from=build /usr/src/app/yarn.lock /usr/src/app/yarn.lock

# Prisma database schema generation
RUN yarn prisma generate

# Copy dist files and create LOGs folder
COPY ./dist ./dist
RUN mkdir logs

CMD ["pm2-runtime", "start", "ecosystem.config.js"]