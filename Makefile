.PHONY: run-fetcher build-lib

run-fetcher-dev:
	STORAGE_DIR=$(shell pwd)/data-new lerna run dev --scope=bandicoot-fetcher

build-lib:
	lerna run build --ignore "*webapp"
