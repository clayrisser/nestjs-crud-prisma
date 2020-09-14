#!/bin/sh

. prisma/scripts/dotenv.sh
echo "$POSTGRES_URL"
if [ -z "$POSTGRES_URL" ]; then
  export POSTGRES_URL=postgresql://$POSTGRES_USERNAME:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DATABASE?sslmode=$POSTGRES_SSLMODE
fi
echo "$POSTGRES_URL"

cat <<EOF > prisma/.env
# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------
POSTGRES_URL=$POSTGRES_URL
EOF

node_modules/.bin/prisma generate
