#!/usr/bin/env node
// check-staleness.mjs — fail the build if source data is stale.
//
// Walks content/stages/*.md and data/*.{yml,yaml} and checks two things:
//   1. `asOf:` lines — warn if older than --warn-days, fail if older than --fail-days
//   2. `validUntil:` lines — fail if today is past that date (volatile-number gate)
//
// Usage:
//   node scripts/check-staleness.mjs
//   node scripts/check-staleness.mjs --warn-days=180 --fail-days=365
//
// Exit code 1 if any item exceeds --fail-days OR is past validUntil.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.+)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const WARN_DAYS = Number(args['warn-days'] ?? 180);
const FAIL_DAYS = Number(args['fail-days'] ?? 365);
const ROOTS = ['content/stages', 'data'];

function* walk(dir) {
  let entries;
  try { entries = readdirSync(dir); } catch { return; }
  for (const entry of entries) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const now = Date.now();
const findings = [];

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!/\.(md|ya?ml)$/.test(file)) continue;
    const lines = readFileSync(file, 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const asOf = lines[i].match(/^\s*asOf:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
      if (asOf) {
        const ts = Date.parse(asOf[1] + 'T00:00:00Z');
        if (Number.isNaN(ts)) continue;
        const ageDays = Math.floor((now - ts) / 86_400_000);
        if (ageDays > FAIL_DAYS) {
          findings.push({ file, line: i + 1, kind: 'asOf', date: asOf[1], age: ageDays, level: 'FAIL' });
        } else if (ageDays > WARN_DAYS) {
          findings.push({ file, line: i + 1, kind: 'asOf', date: asOf[1], age: ageDays, level: 'WARN' });
        }
        continue;
      }
      const validUntil = lines[i].match(/^\s*validUntil:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
      if (validUntil) {
        const ts = Date.parse(validUntil[1] + 'T23:59:59Z');
        if (Number.isNaN(ts)) continue;
        if (now > ts) {
          const overdueDays = Math.floor((now - ts) / 86_400_000);
          findings.push({ file, line: i + 1, kind: 'validUntil', date: validUntil[1], age: overdueDays, level: 'FAIL' });
        }
      }
    }
  }
}

const fails = findings.filter((f) => f.level === 'FAIL');
const warns = findings.filter((f) => f.level === 'WARN');

for (const f of [...fails, ...warns]) {
  if (f.kind === 'validUntil') {
    console.log(`${f.level}: ${f.file}:${f.line}  validUntil=${f.date} (overdue ${f.age}d)`);
  } else {
    console.log(`${f.level}: ${f.file}:${f.line}  asOf=${f.date}  age=${f.age}d`);
  }
}

console.log(
  `\nStaleness check: ${fails.length} failed (asOf >${FAIL_DAYS}d or past validUntil), ${warns.length} warned (asOf >${WARN_DAYS}d)`
);

if (fails.length > 0) process.exit(1);
process.exit(0);
