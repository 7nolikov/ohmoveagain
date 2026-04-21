#!/usr/bin/env node
// check-staleness.mjs — fail the build if any source `asOf` date is too old.
//
// Walks content/stages/*.md and data/*.{yml,yaml}, finds every `asOf:` line,
// and reports anything older than the warn/fail thresholds.
//
// Usage:
//   node scripts/check-staleness.mjs
//   node scripts/check-staleness.mjs --warn-days=180 --fail-days=365
//
// Exit code 1 if any item exceeds --fail-days. Warnings do not fail the build.

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
      const m = lines[i].match(/^\s*asOf:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
      if (!m) continue;
      const ts = Date.parse(m[1] + 'T00:00:00Z');
      if (Number.isNaN(ts)) continue;
      const ageDays = Math.floor((now - ts) / 86_400_000);
      if (ageDays > FAIL_DAYS) {
        findings.push({ file, line: i + 1, date: m[1], age: ageDays, level: 'FAIL' });
      } else if (ageDays > WARN_DAYS) {
        findings.push({ file, line: i + 1, date: m[1], age: ageDays, level: 'WARN' });
      }
    }
  }
}

const fails = findings.filter((f) => f.level === 'FAIL');
const warns = findings.filter((f) => f.level === 'WARN');

for (const f of [...fails, ...warns]) {
  console.log(`${f.level}: ${f.file}:${f.line}  asOf=${f.date}  age=${f.age}d`);
}

console.log(
  `\nStaleness check: ${fails.length} failed (>${FAIL_DAYS}d), ${warns.length} warned (>${WARN_DAYS}d)`
);

if (fails.length > 0) process.exit(1);
process.exit(0);
