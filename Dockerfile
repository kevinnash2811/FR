FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json /app

RUN npm ci

COPY . /app

ARG ENVIRONMENT="quality"

ENV ENVIRONMENT=${ENVIRONMENT}

RUN npm run build-only:${ENVIRONMENT}

FROM nginx:alpine-slim AS production

RUN mkdir -p /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/src/cert/server.crt /etc/nginx/ssl/server.crt 
COPY --from=build /app/src/cert/server.key /etc/nginx/ssl/server.key
COPY --from=build /app/src/cert/default.conf /etc/nginx/conf.d

EXPOSE 80 443

CMD ["nginx","-g","daemon off;"]