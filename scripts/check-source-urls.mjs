#!/usr/bin/env node
// check-source-urls.mjs — a source URL must resolve to itself.
//
// The weekly link check asks "does this URL answer?" and follows redirects to
// find out. That question cannot distinguish a live citation from a dead one.
// On 2026-09-13 every one of the 92 source URLs in data/ passed it, while
//
//   https://www.gov.pl/web/finanse/podatek-dochodowy-od-osob-fizycznych
//
// — the source for Poland's income tax rate — redirected to the bare
// https://www.gov.pl/ homepage. The page it cited had been deleted. Both the
// link check and the staleness watch were green, because one of them only
// wanted a 200 and the other only wanted a recent date.
//
// So this checks a different thing: after following redirects, did we end up
// where the repo says the source lives? A source that now answers from
// somewhere else has either moved (update the URL) or been deleted and
// swallowed by a landing page (find a real source, or drop the claim).
//
// Scope is citations only. offices.yaml holds `booking:` and `mapUrl:`, which
// are navigation — a booking portal bouncing you to its login screen is the
// portal working, not a source rotting.
//
// Escape hatch: set `redirectOk: true` next to a URL that is expected to
// redirect forever. It has to be written down, per source, with the reason in
// a comment — silence is what let gov.pl sit there.
//
// Usage:
//   node scripts/check-source-urls.mjs
//   node scripts/check-source-urls.mjs --json
//   node scripts/check-source-urls.mjs --timeout=30 --concurrency=4

import {
  gatherSources, normalize,
} from './source-urls-lib.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.+)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const TIMEOUT_MS = Number(args['timeout'] ?? 30) * 1000;
const CONCURRENCY = Number(args['concurrency'] ?? 4);
const JSON_MODE = !!args['json'];

const USER_AGENT =
  'Mozilla/5.0 (compatible; ohmoveagain-sourcecheck/1.0; +https://ohmoveagain.com/)';

async function resolveFinalUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT },
    });
    return { status: res.status, finalUrl: res.url };
  } catch (err) {
    return { status: 0, finalUrl: null, error: err.name === 'AbortError' ? 'timeout' : err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function pooled(items, size, worker) {
  const results = [];
  let next = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

const sources = gatherSources((file, err) => {
  console.error(`cannot parse ${file}: ${err.message}`);
  process.exitCode = 2;
});
// The same URL can back several claims; check it once, report every owner.
const byUrl = new Map();
for (const s of sources) {
  if (!byUrl.has(s.url)) byUrl.set(s.url, []);
  byUrl.get(s.url).push(s);
}

const checked = await pooled([...byUrl.keys()], CONCURRENCY, async (url) => ({
  url,
  ...(await resolveFinalUrl(url)),
}));

const findings = [];
for (const { url, status, finalUrl, error } of checked) {
  const owners = byUrl.get(url);
  const where = owners.map((o) => `${o.file}${o.id ? `:${o.id}` : ''}`).join(', ');

  if (status === 0) {
    // Unreachable is the link check's job, not this one. Reported so the run
    // is honest about what it could not judge, but it does not fail the build.
    findings.push({ level: 'SKIP', url, where, reason: error || 'unreachable' });
    continue;
  }

  if (owners.every((o) => o.redirectOk)) continue;
  if (finalUrl && normalize(finalUrl) !== normalize(url)) {
    findings.push({ level: 'MOVED', url, finalUrl, where, status });
  }
}

if (JSON_MODE) {
  console.log(JSON.stringify({ checked: byUrl.size, findings }, null, 2));
} else {
  for (const f of findings) {
    if (f.level === 'MOVED') {
      console.log(`MOVED ${f.url}\n   -> ${f.finalUrl}\n      cited by ${f.where}`);
    } else {
      console.log(`SKIP  ${f.url} (${f.reason})\n      cited by ${f.where}`);
    }
  }
  const moved = findings.filter((f) => f.level === 'MOVED').length;
  const skipped = findings.filter((f) => f.level === 'SKIP').length;
  console.log(
    `\nSource URLs: ${byUrl.size} checked — ${moved} moved, ${skipped} unreachable (not judged).`
  );
}

process.exit(findings.some((f) => f.level === 'MOVED') ? 1 : 0);
