.PHONY: all
all: image/build-and-push

.ONESHELL:
SHELL := /bin/bash
.SHELLFLAGS = -ec

ENVIRONMENT ?= dev
VALID_ENVIRONMENTS := dev stg prd
IMAGE_TAG ?= localhost:5001/zq2-staking-frontend:latest

# Check if the ENVIRONMENT variable is in the list of valid environments
ifeq ($(filter $(ENVIRONMENT),$(VALID_ENVIRONMENTS)),)
$(error Invalid value for ENVIRONMENT. Valid values are dev, stg, or prd.)
endif

## Build and push the Docker image
image/build-and-push:
	cd ../../ && docker build -f images/frontend/Dockerfile -t "${IMAGE_TAG}" .
docker push "${IMAGE_TAG}"