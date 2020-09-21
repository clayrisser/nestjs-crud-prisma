include node_modules/makefiles/makefiles.mk

BABEL := node_modules/.bin/babel
BABEL_NODE := node_modules/.bin/babel-node
CSPELL := node_modules/.bin/cspell
ESLINT := node_modules/.bin/eslint
JEST := node_modules/.bin/jest
LOCKFILE_LINT := node_modules/.bin/lockfile-lint
MAJESTIC := node_modules/.bin/majestic
PRETTIER := node_modules/.bin/prettier
TSC := node_modules/.bin/tsc
COLLECT_COVERAGE_FROM := ["src/**/*.{js,jsx,ts,tsx}"]

BUILD_DEPS := $(patsubst src/%.ts,lib/%.d.ts,$(shell find src -name '*.ts' -not -name '*.d.ts')) \
	$(patsubst src/%.tsx,lib/%.d.ts,$(shell find src -name '*.tsx'))
BUILD_TARGET := $(BUILD_DEPS) lib

FORMAT_DEPS := $(patsubst %,$(DONE)/_format/%,$(shell $(GIT) ls-files | grep -v -E "^example\/" | grep -E "\.((json)|(ya?ml)|(md)|([jt]sx?))$$"))
FORMAT_TARGET := $(FORMAT_DEPS) $(DONE)/format

LINT_DEPS := $(patsubst %,$(DONE)/_lint/%,$(shell $(GIT) ls-files | grep -v -E "^example\/" | grep -E "\.([jt]sx?)$$"))
LINT_TARGET := $(LINT_DEPS) $(DONE)/lint

SPELLCHECK_DEPS := $(patsubst %,$(DONE)/_spellcheck/%,$(shell $(GIT) ls-files | grep -v -E "^example\/"))
SPELLCHECK_TARGET := $(SPELLCHECK_DEPS) $(DONE)/spellcheck

TEST_DEPS := $(patsubst %,$(DONE)/_test/%,$(shell $(GIT) ls-files | grep -v -E "^example\/" | grep -E "\.([jt]sx?)$$"))
TEST_TARGET := $(TEST_DEPS) $(DONE)/test

.PHONY: all
all: build

.PHONY: install
install: node_modules
node_modules: package.json
	@$(NPM) install

.PHONY: prepare
prepare:
	@

.PHONY: format +format _format ~format
format: _format ~format
~format: $(FORMAT_TARGET)
+format: _format $(FORMAT_TARGET)
_format:
	-@rm -rf $(DONE)/_format $(NOFAIL)
$(DONE)/format:
	@for i in $$($(call get_deps,format)); do echo $$i | \
		grep -E "\.[jt]sx?$$"; done | xargs $(ESLINT) --fix >/dev/null ||true
	@$(PRETTIER) --write $(shell $(call get_deps,format))
	@$(call reset_deps,format)
	@$(call done,format)
$(DONE)/_format/%: %
	-@rm $(DONE)/format $(NOFAIL)
	@$(call add_dep,format,$<)
	@$(call add_cache,$@)

.PHONY: spellcheck +spellcheck _spellcheck ~spellcheck
spellcheck: _spellcheck ~spellcheck
~spellcheck: ~format $(SPELLCHECK_TARGET)
+spellcheck: _spellcheck $(SPELLCHECK_TARGET)
_spellcheck:
	-@rm -rf $(DONE)/_spellcheck $(NOFAIL)
$(DONE)/spellcheck:
	-@$(CSPELL) --config .cspellrc $(shell $(call get_deps,spellcheck))
	@$(call reset_deps,spellcheck)
	@$(call done,spellcheck)
$(DONE)/_spellcheck/%: %
	-@rm $(DONE)/spellcheck $(NOFAIL)
	@$(call add_dep,spellcheck,$<)
	@$(call add_cache,$@)

.PHONY: lint +lint _lint ~lint
lint: _lint ~lint
~lint: ~spellcheck $(LINT_TARGET)
+lint: _lint $(LINT_TARGET)
_lint:
	-@rm -rf $(DONE)/_lint $(NOFAIL)
$(DONE)/lint:
# -@$(LOCKFILE_LINT) --type npm --path package-lock.json --validate-https
	-@$(ESLINT) -f json -o node_modules/.tmp/eslintReport.json $(shell $(call get_deps,lint)) $(NOFAIL)
	-@$(ESLINT) $(shell $(call get_deps,lint))
	@$(call reset_deps,lint)
	@$(call done,lint)
$(DONE)/_lint/%: %
	-@rm $(DONE)/lint $(NOFAIL)
	@$(call add_dep,lint,$<)
	@$(call add_cache,$@)

.PHONY: test +test _test ~test
test: _test ~test
~test: ~lint $(TEST_TARGET)
+test: _test $(TEST_TARGET)
_test:
	-@rm -rf $(DONE)/_test $(NOFAIL)
$(DONE)/test:
	-@$(JEST) --json --outputFile=node_modules/.tmp/jestTestResults.json --coverage \
		--coverageDirectory=node_modules/.tmp/coverage --testResultsProcessor=jest-sonar-reporter \
		--collectCoverageFrom='$(COLLECT_COVERAGE_FROM)' --findRelatedTests $(shell $(call get_deps,test))
	@$(call reset_deps,test)
	@$(call done,test)
$(DONE)/_test/%: %
	-@rm $(DONE)/test $(NOFAIL)
	@$(call add_dep,test,$<)
	@$(call add_cache,$@)

.PHONY: build +build _build ~build
build: _build ~build
~build: ~test $(BUILD_TARGET)
+build: _build $(BUILD_TARGET)
_build:
	-@rm -rf lib $(NOFAIL)
lib:
	-@rm -r node_modules/.tmp/lib $(NOFAIL)
	@$(BABEL) src -d lib --extensions '.ts,.tsx' --source-maps
	@$(TSC) -d --emitDeclarationOnly
	@cp -r node_modules/.tmp/lib/src/. lib $(NOFAIL)
#	-@rm -rf example/node_modules/nestjs-crud-prisma/lib && cp -r lib example/node_modules/nestjs-crud-prisma/lib

.PHONY: coverage
coverage: ~lint
	@$(MAKE) -s +coverage
+coverage:
	@$(JEST) --coverage --collectCoverageFrom='$(COLLECT_COVERAGE_FROM)' $(ARGS)

.PHONY: test-ui
test-ui: ~lint
	@$(MAKE) -s +test-ui
+test-ui:
	@$(MAJESTIC) $(ARGS)

.PHONY: test-watch
test-watch: ~lint
	@$(MAKE) -s +test-watch
+test-watch:
	@$(JEST) --watch $(ARGS)

.PHONY: start +start
start: ~format
	@$(MAKE) -s +start
+start:
	@cd example && $(NPM) run start

.PHONY: clean
clean:
	-@$(JEST) --clearCache
ifeq ($(PLATFORM), win32)
	-@$(GIT) clean -fXd \
		-e !/node_modules \
		-e !/node_modules/**/* \
		-e !/yarn.lock \
		-e !/pnpm-lock.yaml \
		-e !/package-lock.json \
		-e !/*/node_modules \
		-e !/*/node_modules/**/* \
		-e !/*/yarn.lock \
		-e !/*/pnpm-lock.yaml \
		-e !/*/package-lock.json
else
	-@$(GIT) clean -fXd \
		-e \!/node_modules \
		-e \!/node_modules/**/* \
		-e \!/yarn.lock \
		-e \!/pnpm-lock.yaml \
		-e \!/package-lock.json \
		-e \!/*/node_modules \
		-e \!/*/node_modules/**/* \
		-e \!/*/yarn.lock \
		-e \!/*/pnpm-lock.yaml \
		-e \!/*/package-lock.json
endif
	-@$(RM) -rf node_modules/.cache
	-@$(RM) -rf node_modules/.make
	-@$(RM) -rf node_modules/.tmp

.PHONY: purge
purge: clean
	-@$(GIT) clean -fXd

.PHONY: report
report: spellcheck lint test
	@

%:
	@
