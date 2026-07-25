#!/usr/bin/env bash
# Build the site for local auditing and start a static server on $PORT.
#
# Shared by the `audit` and `e2e` jobs in pr-check.yml so the two cannot
# drift apart — they must exercise byte-identical output.
#
# The site is served at the root. It lived under a /ohmoveagain/ subpath
# until 2026-07-25, which is why this script used to mirror the build into
# _serve/ohmoveagain and copy 404.html up a level; neither is needed now that
# production is https://ohmoveagain.com/.
set -euo pipefail

PORT="${PORT:-4000}"

hugo --gc --minify --baseURL "http://localhost:${PORT}/"

# Server output goes to a file, not the inherited stdout: if a caller pipes
# this script (`./build-and-serve.sh | tail`), a background process holding
# the pipe open means the caller never sees EOF and hangs forever.
npx serve ./public -l "${PORT}" >/tmp/serve.log 2>&1 &

# Poll until the server actually answers. A fixed `sleep` raced the audit
# steps on slow runners and failed for no real reason.
for _ in $(seq 1 60); do
  if curl -fsS -o /dev/null "http://localhost:${PORT}/"; then
    echo "static server up on ${PORT}"
    exit 0
  fi
  sleep 1
done

echo "static server did not come up within 60s" >&2
exit 1
