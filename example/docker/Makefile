NAME := $(shell node -e "console.log(require('../package.json').name)")
REGISTRY := $(shell node -e "console.log(require('../package.json').docker.registry)")
VERSION := $(shell node -e "console.log(require('../package.json').version)")
IMAGE := $(REGISTRY)/$(NAME)

MAJOR := $(shell echo $(VERSION) | cut -d. -f1)
MINOR := $(shell echo $(VERSION) | cut -d. -f2)
PATCH := $(shell echo $(VERSION) | cut -d. -f3)

.EXPORT_ALL_VARIABLES:

.PHONY: all
all: build

.PHONY: build
build:
	@docker-compose -f docker-build.yaml build

.PHONY: pull
pull:
	@docker-compose -f docker-build.yaml pull

.PHONY: push
push:
	@docker-compose -f docker-build.yaml push

.PHONY: ssh
ssh: docker-build
	@docker ps | grep $(NAME)$$ >$(NULL) 2>&1 && \
		docker exec -it $(NAME) /bin/sh|| \
		docker run --rm -it --entrypoint /bin/sh $(IMAGE):latest

.PHONY: up
up:
	@docker-compose up $(ARGS)

.PHONY: stop
stop:
	@docker-compose stop

.PHONY: postgres
postgres:
	@docker-compose up $(ARGS) postgres

.PHONY: clean
clean:
	-@docker-compose -f docker/docker-compose.yaml kill
	-@docker-compose -f docker/docker-compose.yaml down
	-@docker volume rm \
		postgres-$(NAME) \
		2>$(NULL)

%:
	@
