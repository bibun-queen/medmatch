#!/usr/bin/env bash
set -euo pipefail
rm -rf dist
mkdir -p dist/src
cp index.html styles.css config.js privacy.html terms.html dist/
cp src/*.js dist/src/
