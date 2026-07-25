#!/usr/bin/env bash
# Build the site for local auditing and start a static server on $PORT.
#
# Shared by the `audit` and `e2e` jobs in pr-check.yml so the two cannot
# drift apart — they must exercise byte-identical output.
set -euo pipefail

PORT="${PORT:-4000}"

hugo --gc --minify --baseURL "http://localhost:${PORT}/ohmoveagain/"

# Mirror the subpath so /ohmoveagain/* resolves under the static server
# (matches production layout at https://7nolikov.dev/ohmoveagain/).
rm -rf _serve
mkdir _serve
mv public _serve/ohmoveagain

# `serve` (serve-handler) auto-serves /404.html for missing paths. Copy Hugo's
# 404 to the root so tests see the real page, not serve's bare default.
cp _serve/ohmoveagain/404.html _serve/404.html

npx serve ./_serve -l "${PORT}" &

# Poll until the server actually answers. A fixed `sleep` raced the audit
# steps on slow runners and failed for no real reason.
for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://localhost:${PORT}/ohmoveagain/"; then
    echo "static server up on ${PORT}"
    exit 0
  fi
  sleep 1
done

echo "static server did not come up within 60s" >&2
exit 1
