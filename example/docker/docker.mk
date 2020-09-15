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
	@$(MAKE) -s +push
+push:
	@docker-compose -f docker-build.yaml push

.PHONY: ssh
ssh:
	@$(MAKE) -s +ssh
+ssh:
	@docker ps | grep "$(NAME)$$" >/dev/null 2>&1 && \
		docker exec -it $(NAME) /bin/sh|| \
		docker run --rm -it --entrypoint /bin/sh $(IMAGE):latest

.PHONY: up
up:
	@$(MAKE) -s +up
+up:
	@docker-compose up $(ARGS)

.PHONY: stop
stop:
	@docker-compose stop

.PHONY: clean
clean:
	-@docker-compose -f docker-compose.yaml kill
	-@docker-compose -f docker-compose.yaml down
	-@docker-compose -f docker-compose.yaml rm -v
