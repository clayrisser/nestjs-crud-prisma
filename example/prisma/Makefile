include ../node_modules/makefiles/makefiles.mk

BABEL_NODE := ../node_modules/.bin/babel-node
GENERATE_PRISMA := ../node_modules/.bin/generate-prisma
PRISMA := ../node_modules/.bin/prisma
WAIT_FOR_POSTGRES := ../node_modules/.bin/wait-for-postgres

.PHONY: up
up: generate postgres
	@$(WAIT_FOR_POSTGRES)
	@$(PRISMA) migrate up --experimental

.PHONY: down
down: generate postgres
	@$(WAIT_FOR_POSTGRES)
	@$(PRISMA) migrate down --experimental

.PHONY: save
save:
	@$(PRISMA) migrate save --experimental

.PHONY: introspect
introspect:
	@$(PRISMA) introspect

.PHONY: format
format:
	@$(PRISMA) format

.PHONY: studio
studio:
	@$(PRISMA) studio --experimental

.PHONY: generate
generate:
	@$(GENERATE_PRISMA) ..

.PHONY: generate-watch
generate-watch:
	@$(PRISMA) generate --watch

.PHONY: seed
seed: up
	@$(BABEL_NODE) --extensions '.ts,.tsx' seed.ts

.PHONY: postgres
postgres:
	@$(MAKE) -s -C ../docker postgres ARGS="-d"

%:
	@
