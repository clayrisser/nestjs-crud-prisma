#!/bin/sh

PRISMA="$(dirname $0)/../../node_modules/.bin/prisma"

. $(dirname $0)/dotenv.sh $(dirname $0)/../..
echo "$POSTGRES_URL"
if [ -z "$POSTGRES_URL" ]; then
  export POSTGRES_URL=postgresql://$POSTGRES_USERNAME:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DATABASE?sslmode=$POSTGRES_SSLMODE
fi
echo "$POSTGRES_URL"

cat <<EOF > $(dirname $0)/../.env
# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------
POSTGRES_URL=$POSTGRES_URL
EOF

$PRISMA generate
