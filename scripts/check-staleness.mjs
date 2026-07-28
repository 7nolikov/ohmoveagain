#!/usr/bin/env node
// check-staleness.mjs — warn/fail on stale or expiring source data.
//
// For data/stages/*.yaml, thresholds are tier-aware (A-TR7):
//   official      — warn at 335d, fail at 365d
//   supranational — warn at 150d, fail at 180d
//   community     — warn at  60d, fail at  90d
//
// For all other files (offices, fees, countries…) the default thresholds apply:
//   warn at --warn-days (default 180), fail at --fail-days (default 365)
//
// Usage:
//   node scripts/check-staleness.mjs
//   node scripts/check-staleness.mjs --warn-days=180 --fail-days=365
//   node scripts/check-staleness.mjs --json          # emit JSON to stdout

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.+)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const WARN_DAYS = Number(args['warn-days'] ?? 180);
const FAIL_DAYS = Number(args['fail-days'] ?? 365);
const JSON_MODE = !!args['json'];

// Tier-based cadences. warn = fail - 30 so the watch fires 30d before the build breaks.
const TIER_FAIL = { official: 365, supranational: 180, community: 90 };
const TIER_WARN = { official: 335, supranational: 150, community: 60 };

const STAGE_YAML_DIR = 'data/stages';
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

function recordDate(date, warnDays, failDays, meta) {
  const ts = Date.parse(date + 'T00:00:00Z');
  if (Number.isNaN(ts)) return;
  const ageDays = Math.floor((now - ts) / 86_400_000);
  if (ageDays > failDays) {
    findings.push({ level: 'FAIL', kind: 'asOf', date, age: ageDays, ...meta });
  } else if (ageDays > warnDays) {
    findings.push({ level: 'WARN', kind: 'asOf', date, age: ageDays, ...meta });
  }
}

function recordValidUntil(date, meta) {
  const ts = Date.parse(date + 'T23:59:59Z');
  if (Number.isNaN(ts)) return;
  if (now > ts) {
    const overdueDays = Math.floor((now - ts) / 86_400_000);
    findings.push({ level: 'FAIL', kind: 'validUntil', date, age: overdueDays, ...meta });
  }
}

// ── Tier-aware stage YAML check (A-TR7) ──────────────────────────────────────

// Recursively record every inline `source: { asOf, validUntil }` in a stage
// document, wherever the schema happens to put it. The top-level `sources:`
// list is skipped — it carries an explicit tier and is checked separately.
export function walkInlineSources(node, file, ownerId = null) {
  if (Array.isArray(node)) {
    for (const child of node) walkInlineSources(child, file, ownerId);
    return;
  }
  if (!node || typeof node !== 'object') return;

  const id = typeof node.id === 'string' ? node.id : ownerId;
  const src = node.source;
  if (src && typeof src === 'object' && !Array.isArray(src)) {
    if (src.asOf) recordDate(src.asOf, WARN_DAYS, FAIL_DAYS, { file, item: id });
    if (src.validUntil) recordValidUntil(src.validUntil, { file, item: id });
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'sources' || key === 'source') continue;
    walkInlineSources(value, file, id);
  }
}

function checkStageYaml(file) {
  let doc;
  try { doc = parseYaml(readFileSync(file, 'utf8')); } catch { return; }
  if (!doc || typeof doc !== 'object') return;

  // Top-level sources list — each has an explicit tier
  if (Array.isArray(doc.sources)) {
    for (const src of doc.sources) {
      const tier = (src.type || 'community').toLowerCase();
      const failDays = TIER_FAIL[tier] ?? FAIL_DAYS;
      const warnDays = TIER_WARN[tier] ?? WARN_DAYS;

      // Validate tier value
      if (!TIER_FAIL[tier]) {
        findings.push({ level: 'FAIL', kind: 'tier', value: src.type, file });
      }

      const date = src.lastChecked || src.asOf;
      if (date) recordDate(date, warnDays, failDays, { file, tier, source: src.id });
    }
  }

  // Inline per-item sources — no explicit tier, so the defaults apply.
  //
  // This used to hard-code the path doc.claims[].items[].source. The schema
  // moved (v2 puts checklist items under checklist[].items[], and exit.yaml
  // uses countries[].items[]), and when it moved this check silently stopped
  // matching anything at all — 45 of 76 sources, including every source on the
  // exit page, went unchecked while the build still reported OK. Walk the
  // document instead of naming one path, so the next schema change cannot
  // quietly re-open the same hole.
  walkInlineSources(doc, file);
}

// ── Line-by-line check for other files ───────────────────────────────────────

function checkFileLineByLine(file) {
  const lines = readFileSync(file, 'utf8').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const asOf = lines[i].match(/^\s*(?:asOf|lastChecked|lastReviewed):\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
    if (asOf) {
      recordDate(asOf[1], WARN_DAYS, FAIL_DAYS, { file, line: i + 1 });
      continue;
    }
    const validUntil = lines[i].match(/^\s*validUntil:\s*["']?(\d{4}-\d{2}-\d{2})["']?/);
    if (validUntil) {
      recordValidUntil(validUntil[1], { file, line: i + 1 });
    }
  }
}

// ── Walk all roots ────────────────────────────────────────────────────────────

for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!/\.(md|ya?ml)$/.test(file)) continue;
    if (file.startsWith(STAGE_YAML_DIR + '/') && file.endsWith('.yaml')) {
      checkStageYaml(file);
    } else {
      checkFileLineByLine(file);
    }
  }
}

// ── Output ────────────────────────────────────────────────────────────────────

const fails = findings.filter((f) => f.level === 'FAIL');
const warns = findings.filter((f) => f.level === 'WARN');

if (JSON_MODE) {
  process.stdout.write(JSON.stringify({ fails, warns }, null, 2) + '\n');
} else {
  for (const f of [...fails, ...warns]) {
    if (f.kind === 'tier') {
      console.log(`${f.level}: ${f.file}  invalid source.type="${f.value}" (allowed: official, supranational, community)`);
    } else if (f.kind === 'validUntil') {
      const loc = f.line ? `:${f.line}` : (f.claim ? ` [${f.claim}]` : '');
      console.log(`${f.level}: ${f.file}${loc}  validUntil=${f.date} (overdue ${f.age}d)`);
    } else {
      const loc = f.line ? `:${f.line}` : '';
      const ctx = f.tier ? `  tier=${f.tier}` : '';
      const src = f.source ? `  source=${f.source}`
        : (f.claim ? `  claim=${f.claim}` : (f.item ? `  item=${f.item}` : ''));
      console.log(`${f.level}: ${f.file}${loc}  asOf=${f.date}  age=${f.age}d${ctx}${src}`);
    }
  }
  console.log(
    `\nStaleness check: ${fails.length} failed, ${warns.length} warned`
    + (fails.length === 0 ? ' — OK' : '')
  );
}

// Set exitCode rather than calling process.exit(): stdout is asynchronous when
// piped, and exiting immediately truncates it at ~8KB. Both pr-check.yml
// (`| tee`) and staleness-watch.yml (`--json >`) read this output.
process.exitCode = fails.length > 0 ? 1 : 0;
