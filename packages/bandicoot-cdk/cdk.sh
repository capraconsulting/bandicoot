#!/bin/bash
set -eu

exec node_modules/.bin/cdk "$@"
