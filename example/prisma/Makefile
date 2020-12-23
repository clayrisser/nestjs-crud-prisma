include ../node_modules/makefiles/makefiles.mk

BABEL_NODE := ../node_modules/.bin/babel-node
GENERATE_PRISMA := ../node_modules/.bin/generate-prisma
PRISMA := ../node_modules/.bin/prisma
WAIT_FOR_POSTGRES := ../node_modules/.bin/wait-for-postgres

.PHONY: deploy
deploy: generate postgres migrations/*/migration.sql
	@$(PRISMA) migrate deploy --preview-feature

.PHONY: dev
dev: postgres env
	@echo | $(PRISMA) migrate dev --preview-feature $(ARGS)

.PHONY: env
env: .env
.env: ../.env
	@$(GENERATE_PRISMA) ..
../.env:
	@$(MAKE) -s -C .. env

.PHONY: introspect
introspect:
	@$(PRISMA) introspect

.PHONY: format
format:
	@$(PRISMA) format

.PHONY: studio
studio:
	@$(PRISMA) studio

.PHONY: generate
generate:
	@$(PRISMA) generate

.PHONY: generate-watch
generate-watch:
	@$(PRISMA) generate --watch

.PHONY: seed
seed: dev
	@$(BABEL_NODE) --extensions '.ts,.tsx' seed.ts

.PHONY: postgres
postgres: env
	@$(MAKE) -s -C ../docker postgres ARGS="-d"
	@$(WAIT_FOR_POSTGRES)

migrations/%/migration.sql:
	@$(MAKE) -s dev ARGS="--create-only"

%:
	@
