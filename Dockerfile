FROM node:14.15.5-alpine3.10 AS build


WORKDIR /workspace
COPY package*.json ./
RUN npm ci
COPY . ./

RUN npm run build && npm prune --production


FROM node:14.15.5-alpine3.10

WORKDIR /workspace
ENV NODE_ENV=production

COPY --from=build /workspace/dist /workspace/dist
COPY --from=build /workspace/node_modules /workspace/node_modules

EXPOSE 1337
ENTRYPOINT [ "node" ]
CMD [ "dist/main.js" ]