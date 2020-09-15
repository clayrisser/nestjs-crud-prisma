#!/bin/sh

BABEL_NODE="../node_modules/.bin/babel-node"
GENERATE_PRISMA="../node_modules/.bin/generate-prisma"
PRISMA="../node_modules/.bin/prisma"
WAIT_FOR_POSTGRES="../node_modules/.bin/wait-for-postgres"

cd prisma
$GENERATE_PRISMA ..
$WAIT_FOR_POSTGRES
$PRISMA migrate up --experimental
$BABEL_NODE --extensions '.ts,.tsx' /opt/app/prisma/seed.ts
cd ..

exec node /opt/app/dist/main
