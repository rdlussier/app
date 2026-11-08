#!/usr/bin/env bash
# Publish the playtest build to GitHub Pages on the fork
# (https://rdlussier.github.io/app/). Preview branch only, never upstream.
# Builds with base /app/ and force-pushes the result to the gh-pages branch,
# which GitHub Pages serves ("Deploy from a branch", gh-pages, / root).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
SRC_SHA=$(git rev-parse --short HEAD)
ORIGIN=$(git remote get-url origin)
npx vite build --base=/app/
touch dist/.nojekyll
TMP=$(mktemp -d)
cp -r dist/. "$TMP"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" \
  commit -q -m "Playtest build of preview branch ${SRC_SHA}"
git push -f "$ORIGIN" gh-pages:gh-pages
cd - >/dev/null
rm -rf "$TMP"
echo "Published ${SRC_SHA} to gh-pages"
