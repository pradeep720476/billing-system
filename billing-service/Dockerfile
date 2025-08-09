# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production

CMD sh -c "if [ \"$RUN_SEED\" = \"true\" ]; then node dist/seeds/main.seed.js; fi && node dist/main.js"
