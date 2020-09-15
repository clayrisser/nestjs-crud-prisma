include ../node_modules/makefiles/makefiles.mk

PRISMA := ../node_modules/.bin/prisma
BABEL_NODE := ../node_modules/.bin/babel-node

.PHONY: up
up: generate postgres
	@$(PRISMA) migrate up --experimental

.PHONY: save
save:
	@$(PRISMA) migrate save --experimental

.PHONY: studio
studio:
	@$(PRISMA) studio --experimental

.PHONY: generate
generate:
	@sh scripts/generate.sh

.PHONY: generate-watch
generate-watch:
	@$(PRISMA) generate --watch

.PHONY: seed
seed: up
	@sh scripts/wait-for-postgres.sh
	@$(BABEL_NODE) --extensions '.ts,.tsx' seed.ts

.PHONY: postgres
postgres:
	@$(MAKE) -s -C ../docker postgres ARGS="-d"

%:
	@
