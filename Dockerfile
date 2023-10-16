FROM node:20 AS base
WORKDIR /usr/src/app

FROM base AS node_modules
COPY package.json package-lock.json ./
RUN npm install

FROM base
COPY . .
COPY --from=node_modules /usr/src/app .
CMD npm run start
