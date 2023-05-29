.PHONY: target
target:
	$(info ${HELP_MESSAGE})
	@exit 0

.PHONY: init
init:
	yarn install

.PHONY: test
test:
	yarn run test

.PHONY: setup-codebuild-agent
setup-codebuild-agent:
	docker build -t codebuild-agent - < test/integration/codebuild-local/Dockerfile.agent

.PHONY: test-smoke
test-smoke: setup-codebuild-agent
	CODEBUILD_IMAGE_TAG=codebuild-agent test/integration/codebuild-local/test_one.sh test/integration/codebuild/buildspec.os.alpine.1.yml alpine 3.16 18

.PHONY: test-integ
test-integ: setup-codebuild-agent
	CODEBUILD_IMAGE_TAG=codebuild-agent test/integration/codebuild-local/test_all.sh test/integration/codebuild

.PHONY: copy-files
copy-files:
	yarn run copy-files

.PHONY: install
install:
	BUILD=$(BUILD) yarn install

.PHONY: format
format:
	yarn run format

# Command to run everytime you make changes to verify everything works
.PHONY: dev
dev: init test

# Verifications to run before sending a pull request
.PHONY: pr
pr: build dev test-smoke

.PHONY: clean
clean:
	yarn run clean

.PHONY: build
build: copy-files
	make install BUILD=1
	yarn run build

.PHONY: pack
pack: build
	yarn pack

define HELP_MESSAGE

Usage: $ make [TARGETS]

TARGETS
	format      Run format to automatically update your code to match our formatting.
	build       Builds the package.
	clean       Cleans the working directory by removing built artifacts.
	dev         Run all development tests after a change.
	init        Initialize and install the dependencies and dev-dependencies for this project.
	pr          Perform all checks before submitting a Pull Request.
	test        Run the Unit tests.

endef
