#!/usr/bin/env bash
# Second opinion on lychee's failures before anyone gets an issue about them.
#
# The weekly check kept reporting links that were alive. Over four runs the
# cast rotated — hnb.hr on 30 Aug, nothing on 6 Sep, gesetze-im-internet.de on
# both 13 Sep runs, gov.me only on the second of them — while every one of those
# URLs answered 200 from a desktop minutes later. Raising the timeout from 20s
# to 45s changed nothing, so this is not slowness; it is government sites that
# intermittently refuse, hang up on, or rate-limit a datacenter IP.
#
# lychee already retries three times, but with a 1s base backoff, so all three
# attempts land inside the same bad few seconds. This re-checks each failed URL
# from scratch, several times, with real gaps between attempts. A URL that
# answers even once is alive and is dropped from the report.
#
# Usage: confirm-broken-links.sh <lychee-report.md> <output.md>
# Exit:  0  something is still failing; <output.md> written
#        1  nothing survived the re-check; no issue is warranted
#        2  the report could not be parsed — treat as a bug, not as "clean"
#
# 0 and 1 are both normal outcomes. Anything else means the caller should fail
# rather than quietly conclude the site is fine.

set -euo pipefail

report="${1:?usage: confirm-broken-links.sh <lychee-report.md> <output.md>}"
out="${2:?usage: confirm-broken-links.sh <lychee-report.md> <output.md>}"

ATTEMPTS="${ATTEMPTS:-3}"
GAP_SECONDS="${GAP_SECONDS:-15}"
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-30}"
# Same set the lychee step accepts: 403 and 429 mean a bot filter saw us, not
# that the page is gone.
ACCEPT_CODES="200 206 301 302 303 307 308 403 429"

# Not `mapfile`: bash 3.2 still ships on macOS and this has to be runnable by
# hand against a downloaded report, not only on the Ubuntu runner.
urls=()
while IFS= read -r url; do
  [ -n "$url" ] && urls+=("$url")
done < <(grep -oE '<https?://[^>]+>' "$report" | tr -d '<>' | sort -u)

if [ "${#urls[@]}" -eq 0 ]; then
  echo "lychee reported a failure but no URL could be parsed out of the report." >&2
  echo "Its output format probably changed; this script must be updated." >&2
  exit 2
fi

confirmed=()
recovered=()

for url in "${urls[@]}"; do
  alive=""
  for attempt in $(seq 1 "$ATTEMPTS"); do
    code=$(curl -sS -L -o /dev/null -w '%{http_code}' \
      --max-time "$TIMEOUT_SECONDS" \
      -A 'Mozilla/5.0 (compatible; ohmoveagain-linkcheck/1.0; +https://ohmoveagain.com/)' \
      "$url" 2>/dev/null) || code="000"

    if grep -qw "$code" <<<"$ACCEPT_CODES"; then
      alive="$code"
      echo "alive  $url (HTTP $code on attempt $attempt)"
      break
    fi
    echo "failed $url (HTTP $code on attempt $attempt)"
    [ "$attempt" -lt "$ATTEMPTS" ] && sleep "$GAP_SECONDS"
  done

  if [ -n "$alive" ]; then
    recovered+=("$url (HTTP $alive)")
  else
    confirmed+=("$url")
  fi
done

echo
echo "confirmed dead: ${#confirmed[@]}   recovered on re-check: ${#recovered[@]}"

if [ "${#recovered[@]}" -gt 0 ]; then
  printf 'recovered: %s\n' "${recovered[@]}"
fi

if [ "${#confirmed[@]}" -eq 0 ]; then
  exit 1
fi

{
  echo "# Broken source links"
  echo
  echo "Each URL below failed lychee **and** failed ${ATTEMPTS} further attempts,"
  echo "${GAP_SECONDS}s apart, with a ${TIMEOUT_SECONDS}s timeout. These are worth opening."
  echo
  for url in "${confirmed[@]}"; do
    echo "- [ ] <$url>"
    grep -F "$url" "$report" | sed 's/^\* /      /' || true
  done

  if [ "${#recovered[@]}" -gt 0 ]; then
    echo
    echo "## Dropped — lychee failed these, the re-check did not"
    echo
    for line in "${recovered[@]}"; do
      echo "- $line"
    done
  fi

  echo
  echo "<details><summary>Full lychee report</summary>"
  echo
  cat "$report"
  echo
  echo "</details>"
} > "$out"

exit 0
