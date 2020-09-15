#!/bin/sh

BABEL_NODE="node_modules/.bin/babel-node"
PRISMA="node_modules/.bin/prisma"

sh prisma/scripts/generate.sh
sh prisma/scripts/wait-for-postgres.sh
$PRISMA migrate up --experimental
$BABEL_NODE --extensions '.ts,.tsx' /opt/app/prisma/seed.ts

exec node /opt/app/dist/src/main
