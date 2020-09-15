MAJOR := $(shell echo $(VERSION) | cut -d. -f1)
MINOR := $(shell echo $(VERSION) | cut -d. -f2)
PATCH := $(shell echo $(VERSION) | cut -d. -f3)

.EXPORT_ALL_VARIABLES:

.PHONY: all
all: build

.PHONY: build
build:
	@docker-compose -f docker-build.yaml build $(ARGS)

.PHONY: pull
pull:
	@docker-compose -f docker-build.yaml pull $(ARGS)

.PHONY: push
push:
	@$(MAKE) -s +push
+push:
	@docker-compose -f docker-build.yaml push $(ARGS)

.PHONY: ssh
ssh:
	@$(MAKE) -s +ssh
+ssh:
	@docker ps | grep -E "$(NAME)$$" >/dev/null 2>&1 && \
		docker exec -it $(NAME) /bin/sh|| \
		docker run --rm -it --entrypoint /bin/sh $(IMAGE):latest

.PHONY: logs
logs:
	@docker-compose logs $(ARGS)

.PHONY: up
up:
	@$(MAKE) -s +up
+up:
	@docker-compose up $(ARGS)

.PHONY: stop
stop:
	@docker-compose stop $(ARGS)

.PHONY: clean
clean:
	-@docker-compose -f docker-compose.yaml kill
	-@docker-compose -f docker-compose.yaml down
	-@docker-compose -f docker-compose.yaml rm -v
	-@docker volume ls --format "{{.Name}}" | grep -E "$(NAME)$$" | xargs docker volume rm $(NOFAIL)
