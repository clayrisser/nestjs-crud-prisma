#!/bin/sh

eval "export $(sed -n 4p $(dirname $0)/../.env)"
echo "waiting for postgres . . ."
until psql "$POSTGRES_URL" -c '\l' >/dev/null; do
  sleep 1
done
echo "postgres ready"
