FROM node:12 AS builder

RUN apt-get update && apt-get install -y \
  build-essential \
  python

WORKDIR /tmp/app

COPY package*.json /tmp/app/
RUN npm install

FROM node:12-alpine

RUN apk add --no-cache \
  make \
  musl \
  postgresql-client

COPY docker/latest/entrypoint.sh /usr/local/sbin/entrypoint
RUN chmod +x /usr/local/sbin/entrypoint

COPY --from=builder /tmp/app /opt/app
WORKDIR /opt/app

COPY . /opt/app/
RUN npm run make -- env && \
  npm run make -- +generate && \
  npm run make -- +build

EXPOSE 3000

ENV DEBUG=0 \
 GRAPHQL_PLAYGROUND=0 \
 KEYCLOAK_BASE_URL=http://keycloak:8080 \
 POSTGRES_HOST=postgres \
 REDIS_HOST=redis \
 SWAGGER=0

ENTRYPOINT [ "/usr/local/sbin/entrypoint" ]
