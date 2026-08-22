#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

cp index.html dist/index.html
cp styles.css dist/styles.css
cp app.js dist/app.js

# 既存の公開用ファイルがあれば保持
for f in privacy.html terms.html config.js favicon.ico; do
  if [ -f "$f" ]; then
    cp "$f" "dist/$f"
  fi
done

echo "Built dist:"
find dist -maxdepth 2 -type f -print
