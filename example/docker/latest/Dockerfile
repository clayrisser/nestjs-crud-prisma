FROM node:12 AS builder

RUN apt-get update && apt-get install -y \
  build-essential \
  make \
  python

WORKDIR /tmp/app

COPY package*.json Makefile /tmp/app/
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
RUN make env && \
  make +generate && \
  make +build

EXPOSE 3000

ENV DEBUG=0 \
 POSTGRES_HOST=postgres \
 SWAGGER=0

ENTRYPOINT [ "/usr/local/sbin/entrypoint" ]
